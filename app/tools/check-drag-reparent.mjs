/**
 * SOP Group 탈착/부착(drag reparent) E2E 회귀 체크 — 에러1·에러3 재발 방지.
 *
 * 사용법: dev 서버를 띄운 뒤 app/ 디렉터리에서 실행한다.
 *   npm run dev          # 별도 터미널 (localhost:5173)
 *   node tools/check-drag-reparent.mjs
 *
 * 검사 시나리오 (로봇개 패트롤 시드 기준):
 *  1. 자식 2개를 그룹 밖으로 드래그 → detach (Task 2→1→0)
 *  2. 하나씩 프레임 안으로 드래그 → attach (Task 0→1→2)
 *  3. 접기/펼치기 사이클 후 detach→attach 왕복
 *  4. [에러3 경계] 헤더로 잡고 프레임 하단부(포인터는 프레임 안, 노드 중심은 밖)에
 *     드롭해도 attach — 판정이 포인터 기준임을 보장
 * headless Edge(Windows 기본 설치)를 puppeteer-core로 구동한다.
 */
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const URL = process.env.APP_URL ?? "http://localhost:5173/";
const BROWSER_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const executablePath = BROWSER_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("Edge/Chrome 실행 파일을 찾지 못했습니다:", BROWSER_CANDIDATES);
  process.exit(1);
}

let passed = 0;
let failed = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${name} — expected ${expected}, got ${actual}`);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--window-size=1920,1080"],
  defaultViewport: { width: 1920, height: 1080 },
});
try {
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));

  await page.goto(URL, { waitUntil: "networkidle0" });
  await page.waitForSelector('select[aria-label="도메인 템플릿 선택"]');
  await page.select('select[aria-label="도메인 템플릿 선택"]', "seed-robot-patrol");
  await page.waitForSelector('.react-flow__node[data-id="seed-rp-task-1"]');
  await new Promise((r) => setTimeout(r, 800)); // fitView 안정화

  const bbox = async (id) =>
    (await page.$(`.react-flow__node[data-id="${id}"]`)).boundingBox();
  const badge = () =>
    page.evaluate(
      () =>
        document.querySelector(
          '.react-flow__node[data-id="seed-rp-sop"] .sop-node__type-badge',
        )?.textContent ?? "(none)",
    );

  async function drag(fx, fy, tx, ty) {
    await page.mouse.move(fx, fy);
    await page.mouse.down();
    await page.mouse.move(tx, ty, { steps: 25 });
    await new Promise((r) => setTimeout(r, 100));
    await page.mouse.up();
    await new Promise((r) => setTimeout(r, 300));
  }
  // 노드 헤더(상단 12px)를 잡아 드래그 — 포트 핸들/nodrag 영역 회피.
  async function dragNodeTo(dataId, toX, toY) {
    const b = await bbox(dataId);
    await drag(b.x + b.width / 2, b.y + 12, toX, toY);
  }

  const group = await bbox("seed-rp-sop");
  const cx = group.x + group.width / 2;
  const below = group.y + group.height + 180;

  check("초기 자식 수", await badge(), "Task 2");

  // 1) 자식 2개 detach
  await dragNodeTo("seed-rp-task-1", cx - 140, below);
  check("task-1 detach", await badge(), "Task 1");
  await dragNodeTo("seed-rp-task-2", cx + 160, below);
  check("task-2 detach", await badge(), "Task 0");

  // 2) 하나씩 재부착 (프레임 중앙부)
  await dragNodeTo("seed-rp-task-1", cx - 60, group.y + group.height * 0.55);
  check("task-1 re-attach", await badge(), "Task 1");
  await dragNodeTo("seed-rp-task-2", cx + 60, group.y + group.height * 0.75);
  check("task-2 re-attach", await badge(), "Task 2");

  // 3) 접기/펼치기 사이클 후 왕복
  const collapseBtn = await page.$(
    '.react-flow__node[data-id="seed-rp-sop"] .sop-group-node__collapse-btn',
  );
  await collapseBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  await collapseBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  const g2 = await bbox("seed-rp-sop");
  await dragNodeTo("seed-rp-task-1", g2.x + g2.width / 2, g2.y + g2.height + 180);
  check("사이클 후 detach", await badge(), "Task 1");
  await dragNodeTo("seed-rp-task-1", g2.x + g2.width / 2 - 60, g2.y + g2.height * 0.55);
  check("사이클 후 re-attach", await badge(), "Task 2");

  // 4) 에러3 경계 — 헤더 grab + 프레임 하단 드롭(노드 중심은 rect 밖) → attach 되어야 한다
  const g3 = await bbox("seed-rp-sop");
  await dragNodeTo("seed-rp-task-1", g3.x + g3.width / 2, g3.y + g3.height + 180);
  check("경계 케이스 준비 detach", await badge(), "Task 1");
  await dragNodeTo("seed-rp-task-1", g3.x + g3.width / 2, g3.y + g3.height - 20);
  check("경계 케이스: 프레임 하단 드롭 attach (에러3)", await badge(), "Task 2");
} finally {
  await browser.close();
}

console.log(`\n결과: ${passed} PASS / ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
