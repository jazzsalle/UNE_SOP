/**
 * 순수 WebGL1 렌더러 — Phase 9 공간 3D 뷰어(결정 1: 신규 의존성 0)의 드로우 계층.
 * 셰이더 2종(램버트 솔리드 / 단색 라인)을 컴파일하고, 장면 아이템별 버퍼를
 * 업로드해 (proj × view) 행렬 하나로 그린다. 불투명 → 라인 → 반투명 순서로
 * 그려 반투명 공간 프리즘의 블렌딩이 자연스럽게 보이도록 한다.
 * 색은 전부 호출부(SpaceViewer3D)가 디자인 토큰에서 해석한 RGB [0..1]로 주입한다
 * — 이 모듈에는 색 리터럴이 없다. React에 의존하지 않는다.
 * 동적 아이템(setDynamic/setDynamicModel): 로봇개 등 매 프레임 움직이는 메시는
 * 버퍼 재업로드 대신 model 행렬 uniform만 갱신해 그린다(정적 장면은 항등 행렬).
 */

import { mat4Identity } from "./mat4";

/** RGB 각 채널 0..1 — 디자인 토큰 해석 결과. */
export type Rgb = readonly [number, number, number];

/** 장면 아이템 — 솔리드(삼각형+법선) 또는 라인(GL_LINES). */
export type SceneItem =
  | {
      kind: "solid";
      positions: Float32Array;
      normals: Float32Array;
      color: Rgb;
      /** 1 미만이면 반투명 패스(depth write 끔)로 그린다. */
      alpha: number;
    }
  | {
      kind: "lines";
      positions: Float32Array;
      color: Rgb;
      alpha: number;
    };

/** 업로드된 아이템 — GPU 버퍼 + 드로우 메타. */
interface UploadedItem {
  item: SceneItem;
  positionBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer | null;
  vertexCount: number;
}

/** 렌더러 핸들 — SpaceViewer3D가 소유·구동한다. */
export interface Renderer {
  /** 장면 교체 — 기존 버퍼를 해제하고 새 아이템을 업로드한다. */
  setScene(items: SceneItem[]): void;
  /**
   * 동적 아이템 교체 — 정적 장면과 별도 버퍼로 업로드하고 setDynamicModel의
   * model 행렬로 그린다(빈 배열이면 동적 렌더 없음). 솔리드는 불투명 취급.
   */
  setDynamic(items: SceneItem[]): void;
  /** 동적 아이템 공용 model 행렬 갱신 — 버퍼 재업로드 없이 매 프레임 호출 가능. */
  setDynamicModel(model: Float32Array): void;
  /** 캔버스 백킹 크기 변경 반영(viewport). */
  resize(width: number, height: number): void;
  /** 한 프레임 그리기 — viewProj = proj × view. */
  draw(viewProj: Float32Array, clearColor: Rgb): void;
  /** 버퍼/프로그램 해제 — 컨텍스트 lost 후 재초기화 전 호출. */
  dispose(): void;
}

/**
 * 램버트 솔리드 정점 셰이더 — 정적 장면은 월드 좌표가 구워진 정점(uModel=항등),
 * 동적 아이템(로봇개)은 uModel로 이동/회전한다. 강체 변환 전제라 법선은
 * uModel 상단 3×3만 적용한다(GLSL ES 1.00은 mat3(mat4) 생성자가 없어 열별 조립).
 */
const SOLID_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uViewProj;
uniform mat4 uModel;
varying vec3 vNormal;
void main() {
  vNormal = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNormal;
  gl_Position = uViewProj * uModel * vec4(aPosition, 1.0);
}
`;

/** 램버트 솔리드 프래그먼트 셰이더 — 고정 방향광 + 앰비언트. */
const SOLID_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 uColor;
uniform float uAlpha;
uniform vec3 uLightDir;
varying vec3 vNormal;
void main() {
  float diffuse = max(dot(normalize(vNormal), uLightDir), 0.0);
  vec3 shaded = uColor * (0.45 + 0.55 * diffuse);
  gl_FragColor = vec4(shaded, uAlpha);
}
`;

/** 단색 라인 정점 셰이더. */
const LINE_VERTEX_SHADER = `
attribute vec3 aPosition;
uniform mat4 uViewProj;
void main() {
  gl_Position = uViewProj * vec4(aPosition, 1.0);
}
`;

/** 단색 라인 프래그먼트 셰이더. */
const LINE_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 uColor;
uniform float uAlpha;
void main() {
  gl_FragColor = vec4(uColor, uAlpha);
}
`;

/** 조명 방향(정규화) — 위 약간 비스듬한 방향광으로 면 구분이 드러나게 한다. */
const LIGHT_DIRECTION: Rgb = [0.42, 0.82, 0.39];

/** 셰이더 1개를 컴파일한다. 실패 시 null(호출부가 폴백 처리). */
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** 정점+프래그먼트 셰이더를 링크한 프로그램. 실패 시 null. */
function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) {
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // 링크 후 셰이더 객체는 불필요 — 프로그램이 참조를 유지한다
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Float32Array를 STATIC_DRAW 버퍼로 업로드한다. */
function uploadBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null {
  const buffer = gl.createBuffer();
  if (!buffer) {
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

/**
 * 캔버스에 WebGL1 렌더러를 생성한다.
 * WebGL 미지원(컨텍스트/셰이더 실패) 시 null — 호출부가 안내 문구로 폴백한다.
 */
export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) {
    return null;
  }
  const solidProgram = createProgram(gl, SOLID_VERTEX_SHADER, SOLID_FRAGMENT_SHADER);
  const lineProgram = createProgram(gl, LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER);
  if (!solidProgram || !lineProgram) {
    return null;
  }

  // attribute/uniform 위치 캐시
  const solidLocations = {
    position: gl.getAttribLocation(solidProgram, "aPosition"),
    normal: gl.getAttribLocation(solidProgram, "aNormal"),
    viewProj: gl.getUniformLocation(solidProgram, "uViewProj"),
    model: gl.getUniformLocation(solidProgram, "uModel"),
    color: gl.getUniformLocation(solidProgram, "uColor"),
    alpha: gl.getUniformLocation(solidProgram, "uAlpha"),
    lightDir: gl.getUniformLocation(solidProgram, "uLightDir"),
  };
  const lineLocations = {
    position: gl.getAttribLocation(lineProgram, "aPosition"),
    viewProj: gl.getUniformLocation(lineProgram, "uViewProj"),
    color: gl.getUniformLocation(lineProgram, "uColor"),
    alpha: gl.getUniformLocation(lineProgram, "uAlpha"),
  };

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // 반투명 프리즘 내부 벽면도 보이도록 컬링은 쓰지 않는다(법선은 명시 제공)
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let uploaded: UploadedItem[] = [];
  // 동적 아이템(로봇개 등) — 정적 장면과 별도 버퍼, model 행렬로 매 프레임 이동
  let dynamicUploaded: UploadedItem[] = [];
  let dynamicModel: Float32Array = mat4Identity();
  const IDENTITY_MODEL = mat4Identity();

  /** 업로드 아이템 목록의 버퍼를 전부 해제한다. */
  const releaseList = (entries: UploadedItem[]) => {
    for (const entry of entries) {
      gl.deleteBuffer(entry.positionBuffer);
      if (entry.normalBuffer) {
        gl.deleteBuffer(entry.normalBuffer);
      }
    }
  };

  /** SceneItem 목록을 GPU 버퍼로 업로드한다 — setScene/setDynamic 공용. */
  const uploadItems = (items: SceneItem[]): UploadedItem[] => {
    const result: UploadedItem[] = [];
    for (const item of items) {
      if (item.positions.length === 0) {
        continue;
      }
      const positionBuffer = uploadBuffer(gl, item.positions);
      if (!positionBuffer) {
        continue;
      }
      const normalBuffer = item.kind === "solid" ? uploadBuffer(gl, item.normals) : null;
      if (item.kind === "solid" && !normalBuffer) {
        gl.deleteBuffer(positionBuffer);
        continue;
      }
      result.push({
        item,
        positionBuffer,
        normalBuffer,
        vertexCount: item.positions.length / 3,
      });
    }
    return result;
  };

  /** 솔리드 아이템 1개 드로우 — 프로그램/uniform은 호출부에서 이미 바인드됨. */
  const drawSolid = (entry: UploadedItem) => {
    if (entry.item.kind !== "solid") {
      return;
    }
    gl.uniform3fv(solidLocations.color, [...entry.item.color]);
    gl.uniform1f(solidLocations.alpha, entry.item.alpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
    gl.vertexAttribPointer(solidLocations.position, 3, gl.FLOAT, false, 0, 0);
    if (entry.normalBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, entry.normalBuffer);
      gl.vertexAttribPointer(solidLocations.normal, 3, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, entry.vertexCount);
  };

  return {
    setScene(items) {
      releaseList(uploaded);
      uploaded = uploadItems(items);
    },

    setDynamic(items) {
      releaseList(dynamicUploaded);
      dynamicUploaded = uploadItems(items);
    },

    setDynamicModel(model) {
      dynamicModel = model;
    },

    resize(width, height) {
      gl.viewport(0, 0, width, height);
    },

    draw(viewProj, clearColor) {
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const opaqueSolids = uploaded.filter(
        (entry) => entry.item.kind === "solid" && entry.item.alpha >= 1,
      );
      const transparentSolids = uploaded.filter(
        (entry) => entry.item.kind === "solid" && entry.item.alpha < 1,
      );
      const lines = uploaded.filter((entry) => entry.item.kind === "lines");

      // 1) 불투명 솔리드 — depth write 켠 상태 (정적=항등 model, 동적=dynamicModel)
      gl.useProgram(solidProgram);
      gl.uniformMatrix4fv(solidLocations.viewProj, false, viewProj);
      gl.uniform3fv(solidLocations.lightDir, [...LIGHT_DIRECTION]);
      gl.enableVertexAttribArray(solidLocations.position);
      gl.enableVertexAttribArray(solidLocations.normal);
      gl.depthMask(true);
      gl.uniformMatrix4fv(solidLocations.model, false, IDENTITY_MODEL);
      for (const entry of opaqueSolids) {
        drawSolid(entry);
      }
      // 동적 솔리드(로봇개) — 불투명 취급, model 행렬만 다르게 적용
      gl.uniformMatrix4fv(solidLocations.model, false, dynamicModel);
      for (const entry of dynamicUploaded) {
        drawSolid(entry);
      }
      gl.disableVertexAttribArray(solidLocations.normal);

      // 2) 라인 — 링크가 반투명 프리즘에 완전히 가려지지 않게 반투명보다 먼저
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(lineLocations.viewProj, false, viewProj);
      gl.enableVertexAttribArray(lineLocations.position);
      for (const entry of lines) {
        if (entry.item.kind !== "lines") {
          continue;
        }
        gl.uniform3fv(lineLocations.color, [...entry.item.color]);
        gl.uniform1f(lineLocations.alpha, entry.item.alpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
        gl.vertexAttribPointer(lineLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, entry.vertexCount);
      }
      gl.disableVertexAttribArray(lineLocations.position);

      // 3) 반투명 솔리드 — depth write 끔(정렬 없이도 무난한 근사). 정적이라 항등 model.
      // attribute enable 상태는 프로그램이 아닌 전역이라 라인 패스 후 다시 켠다.
      gl.useProgram(solidProgram);
      gl.enableVertexAttribArray(solidLocations.position);
      gl.enableVertexAttribArray(solidLocations.normal);
      gl.uniformMatrix4fv(solidLocations.model, false, IDENTITY_MODEL);
      gl.depthMask(false);
      for (const entry of transparentSolids) {
        drawSolid(entry);
      }
      gl.depthMask(true);
      gl.disableVertexAttribArray(solidLocations.position);
      gl.disableVertexAttribArray(solidLocations.normal);
    },

    dispose() {
      releaseList(uploaded);
      uploaded = [];
      releaseList(dynamicUploaded);
      dynamicUploaded = [];
      gl.deleteProgram(solidProgram);
      gl.deleteProgram(lineProgram);
    },
  };
}
