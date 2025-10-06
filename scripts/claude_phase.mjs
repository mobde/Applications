// Node 20+ script that supports Anthropic or OpenRouter providers.
// It reads either ANTHROPIC_API_KEY or OPENROUTER_API_KEY and calls the right API.
// It expects the model to return pure JSON per the contract in the prompt.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const PROVIDER = ANTHROPIC_KEY ? 'anthropic' : (OPENROUTER_KEY ? 'openrouter' : '');

if (!PROVIDER) {
  console.error('❌ Missing both ANTHROPIC_API_KEY and OPENROUTER_API_KEY');
  process.exit(1);
}

const repoRoot = process.cwd();

async function readUtf8(p){ return fs.readFile(p, 'utf8'); }

async function getPhase(){
  const forced = process.env.FORCE_PHASE;
  if (forced && String(forced).trim()) return parseInt(forced, 10);
  try {
    const n = (await readUtf8('state/current_phase.txt')).trim();
    const v = parseInt(n, 10);
    return Number.isFinite(v) ? v : 1;
  } catch { return 1; }
}

async function callWithAnthropic(system, user) {
  const body = {
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 8000,
    temperature: 0.2,
    system,
    messages: [{ role: 'user', content: user }],
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok){
    const t = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${t}`);
  }
  const data = await res.json();
  let text = (data.content || []).map(c => c.text || '').join('').trim();
  return text;
}

async function callWithOpenRouter(system, user) {
  const body = {
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.2,
    max_tokens: 8000,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${OPENROUTER_KEY}`,
      'accept': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok){
    const t = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${t}`);
  }
  const data = await res.json();
  let content = data?.choices?.[0]?.message?.content ?? '';
  if (Array.isArray(content)) {
    content = content.map(p => (typeof p === 'string' ? p : p?.text || '')).join('');
  }
  if (typeof content !== 'string') content = String(content ?? '');
  return content.trim();
}

async function callClaude(system, user){
  const raw = PROVIDER === 'anthropic' ? await callWithAnthropic(system, user)
                                       : await callWithOpenRouter(system, user);
  let text = raw;
  if (text.startsWith('```')){
    text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  }
  let out;
  try { out = JSON.parse(text); }
  catch (e){ throw new Error('Model did not return valid JSON.\n' + text); }
  return out;
}

async function writeFiles(files){
  for (const f of files){
    const fp = path.join(repoRoot, f.path);
    await fs.mkdir(path.dirname(fp), { recursive: true });
    const enc = (f.encoding || 'utf-8').toLowerCase();
    await fs.writeFile(fp, f.content, { encoding: enc === 'utf8' ? 'utf-8' : enc });
    console.log('✍️ wrote', f.path);
  }
}

async function gitCommitAndPush(message){
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ pushed commit');
  } catch {
    console.log('ℹ️ nothing to commit');
  }
}

(async () => {
  const phase = await getPhase();
  const system = await readUtf8('prompts/system.md');
  const phasePrompt = await readUtf8(`prompts/phase-${phase}.md`);

  const outputContract = `
أعد فقط JSON بهذا الشكل بالضبط (بدون أي نص آخر):
{
  "commitMessage": "string",
  "files": [ { "path": "relative/path.ext", "content": "string", "encoding": "utf-8" } ],
  "nextPhaseReady": true|false
}
- path نسبي.
- content هو المحتوى الكامل للملف.
- لا تستخدم أسوار كود أو Markdown.
- لا تقسّم الرد إلى أجزاء.`;

  const user = `PROVIDER=${PROVIDER}\nPHASE #${phase}\n\n${phasePrompt}\n\n${outputContract}`;
  const result = await callClaude(system, user);

  if (!result.files || !Array.isArray(result.files)){
    throw new Error('JSON missing "files" array.');
  }

  await writeFiles(result.files);
  await gitCommitAndPush(result.commitMessage || `phase ${phase} update`);

  if (result.nextPhaseReady){
    const next = String(phase + 1);
    await fs.mkdir('state', { recursive: true });
    await fs.writeFile('state/current_phase.txt', next, 'utf-8');
    await gitCommitAndPush(`advance to phase ${next}`);
  }

  console.log(`🎯 Done Phase ${phase} via ${PROVIDER}`);
})().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
