/**
 * SpaceDetailPanel — 평면에서 선택한 공간/시설물/토폴로지 노드의 상세를 표시한다.
 * 공간: 기본키를 parseSpacePrimaryKey로 UFID·FLOOR·DIVISION·CLASSIFY·SERIAL 분해 +
 *       QAL/SLP/DIR/SKT/HANDICAP 코드·한글 라벨 + baseElevation/height.
 * 시설물: objectCode를 parseObjectCode로 분해 + 시설구분 라벨 + 배치 위치.
 * 토폴로지 노드(Phase 7): 계약 A 필드(층/슬래브/유형/비상구) + metadata JSON + 이웃 목록.
 * 미선택/미해석 시 placeholder. 라벨 조회는 전부 domain/spatial의 순수 함수를 사용한다.
 */
import type { SpatialFacility, SpatialSpace } from "../domain/spatial";
import {
  DIVISION_MAJOR_LABELS,
  DIVISION_CODES,
  attributeLabel,
  classifyLabel,
  divisionLabel,
  facilityKindLabel,
  findFacility,
  findSpace,
  parseObjectCode,
  parseSpacePrimaryKey,
} from "../domain/spatial";
import { findTopologyNode } from "../domain/topology";
import type { TopologyNodeData } from "../domain/topology";
import type { PlanSelection } from "./FloorPlanSvg";

interface SpaceDetailPanelProps {
  /** 평면 뷰의 현재 선택 대상 — null이면 placeholder 표시. */
  selection: PlanSelection | null;
  /** 현재 오버레이 중인 토폴로지 셋 id — topology 선택 해석용(미선택 시 undefined). */
  topologySetId?: string;
}

/** kv 그리드 1행 — 코드값 + 한글 라벨 보조 표기. */
function KvRow({ label, value, hint }: { label: string; value: string; hint?: string | null }) {
  return (
    <>
      <dt className="typo-text-sm">{label}</dt>
      <dd className="typo-text-sm">
        {value}
        {hint ? <span className="space-detail__label-hint">{hint}</span> : null}
      </dd>
    </>
  );
}

/** 공간 상세 — 기본키 분해(별표 5·6) + 속성 코드(별표 6) + 지오메트리. */
function SpaceDetail({ space }: { space: SpatialSpace }) {
  const parsed = parseSpacePrimaryKey(space.primaryKey);
  const major = DIVISION_CODES[space.division].major;
  return (
    <>
      <h3 className="space-detail__name typo-title-sm font-bold">{space.name}</h3>
      <p className="space-detail__kind typo-text-sm">
        공간(RM) · {space.kind} ({space.kindEng})
      </p>

      {/* 표준 기본키 원문 + 명명규칙 분해 (별표 5 레이어코드 + 별표 6 일련번호) */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">
          공간 기본키 분해 (별표 5·6)
        </h4>
        <p className="space-detail__code typo-text-sm">{space.primaryKey}</p>
        {parsed ? (
          <dl className="space-detail__kv">
            <KvRow label="UFID" value={parsed.ufid} hint="공간객체등록번호" />
            <KvRow label="FLOOR" value={parsed.floorCode} />
            <KvRow
              label="DIVISION"
              value={parsed.division}
              hint={`${divisionLabel(parsed.division) ?? "?"} (${DIVISION_MAJOR_LABELS[major]})`}
            />
            <KvRow
              label="CLASSIFY"
              value={parsed.classify}
              hint={classifyLabel(parsed.classify)}
            />
            <KvRow label="SERIAL" value={parsed.serial} hint="일련번호" />
          </dl>
        ) : (
          <p className="spatial-page__plan-empty typo-text-sm">
            표준 기본키 형식으로 해석할 수 없습니다.
          </p>
        )}
      </section>

      {/* 속성 코드 5종 — 코드값 + 한글 라벨 (별표 6) */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">속성 (별표 6)</h4>
        <dl className="space-detail__kv">
          <KvRow label="재질 QAL" value={space.qal} hint={attributeLabel(space.qal)} />
          <KvRow label="경사 SLP" value={space.slp} hint={attributeLabel(space.slp)} />
          <KvRow label="진행방향 DIR" value={space.dir} hint={attributeLabel(space.dir)} />
          <KvRow label="내외부 SKT" value={space.skt} hint={attributeLabel(space.skt)} />
          <KvRow
            label="장애인 HCP"
            value={space.handicap}
            hint={attributeLabel(space.handicap)}
          />
        </dl>
      </section>

      {/* 3D 지오메트리 요약 — footprint + 압출 높이 (별표 3 Room LOD4 단순화) */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">지오메트리</h4>
        <dl className="space-detail__kv">
          <KvRow label="바닥 고도" value={`${space.geometry.baseElevation} m`} />
          <KvRow label="층고(높이)" value={`${space.geometry.height} m`} />
          <KvRow label="footprint" value={`꼭짓점 ${space.geometry.footprint.length}개`} />
        </dl>
      </section>
    </>
  );
}

/** 시설물 상세 — 3차원객체코드 분해(별표 5 나) + 시설구분 라벨 + 위치. */
function FacilityDetail({ facility }: { facility: SpatialFacility }) {
  const parsed = parseObjectCode(facility.objectCode);
  const parentSpace = findSpace(facility.spaceId);
  return (
    <>
      <h3 className="space-detail__name typo-title-sm font-bold">{facility.name}</h3>
      <p className="space-detail__kind typo-text-sm">
        시설물(FC) · {facility.kind} ({divisionLabel(facility.division) ?? facility.division})
      </p>

      {/* 표준 3차원객체코드 원문 + 명명규칙 분해 (별표 5 나) */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">
          3차원객체코드 분해 (별표 5)
        </h4>
        <p className="space-detail__code typo-text-sm">{facility.objectCode}</p>
        {parsed ? (
          <dl className="space-detail__kv">
            <KvRow label="UFID" value={parsed.ufid} hint="공간객체등록번호" />
            <KvRow label="FLOOR" value={parsed.floorCode} />
            <KvRow
              label="DIVISION"
              value={parsed.division}
              hint={divisionLabel(parsed.division)}
            />
            <KvRow
              label="CLASSIFY"
              value={parsed.classify}
              hint={classifyLabel(parsed.classify)}
            />
            <KvRow
              label="시설구분"
              value={parsed.facilityCode}
              hint={facilityKindLabel(parsed.division, parsed.facilityCode)}
            />
            <KvRow label="SERIAL" value={parsed.serial} hint="일련번호" />
          </dl>
        ) : (
          <p className="spatial-page__plan-empty typo-text-sm">
            표준 3차원객체코드 형식으로 해석할 수 없습니다.
          </p>
        )}
      </section>

      {/* 소속 공간 + 배치 위치 */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">배치</h4>
        <dl className="space-detail__kv">
          <KvRow label="소속 공간" value={parentSpace ? parentSpace.name : facility.spaceId} />
          <KvRow
            label="위치 (m)"
            value={`x ${facility.position.x} · y ${facility.position.y} · z ${facility.position.z}`}
          />
        </dl>
      </section>
    </>
  );
}

/** 토폴로지 노드 상세 — 계약 A 필드 + metadata JSON + 이웃 목록(방향·층간 표기). */
function TopologyNodeDetail({ setId, node }: { setId: string; node: TopologyNodeData }) {
  // slabName은 계약 D에 따라 공간 기본키(spaceId) — 공간명을 병기한다.
  const slabSpace = findSpace(node.slabName);
  const hasMetadata = Object.keys(node.metadata).length > 0;
  return (
    <>
      <h3 className="space-detail__name typo-title-sm font-bold">{node.displayName}</h3>
      <p className="space-detail__kind typo-text-sm">
        토폴로지 노드 · {node.nodeTypeCode}
        {node.metadata["checkpoint"] === true ? " · 점검 포인트" : ""}
        {node.isExit ? " · 비상구" : ""}
      </p>

      {/* webbuilder export 계약 A 필드 */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">노드 정보 (계약 A)</h4>
        <dl className="space-detail__kv">
          <KvRow label="id" value={node.id} />
          <KvRow label="floorName" value={node.floorName} hint="FLOOR 코드" />
          <KvRow label="slabName" value={node.slabName} hint={slabSpace?.name ?? null} />
          <KvRow label="nodeTypeCode" value={node.nodeTypeCode} />
          <KvRow label="isExit" value={node.isExit ? "예 (비상구)" : "아니오"} />
          <KvRow
            label="위치 (m)"
            value={`x ${node.worldPosition.x} · y ${node.worldPosition.y} · z ${node.worldPosition.z}`}
            hint="three.js Y-up"
          />
        </dl>
      </section>

      {/* metadata — 점검 포인트(checkpoint·facilityObjectCode) 등 자유 필드 원문 */}
      {hasMetadata && (
        <section className="space-detail__section">
          <h4 className="space-detail__section-title typo-text-md font-bold">metadata</h4>
          <pre className="space-detail__code topology-metadata typo-text-sm">
            {JSON.stringify(node.metadata, null, 2)}
          </pre>
        </section>
      )}

      {/* 이웃 목록 — 상호 참조면 ↔, 단방향이면 → 뱃지 + 타 층이면 floorName 병기 */}
      <section className="space-detail__section">
        <h4 className="space-detail__section-title typo-text-md font-bold">
          이웃 노드 ({node.neighborIds.length}개)
        </h4>
        {node.neighborIds.length === 0 ? (
          <p className="spatial-page__plan-empty typo-text-sm">연결된 이웃이 없습니다.</p>
        ) : (
          <ul className="topology-neighbors">
            {node.neighborIds.map((neighborId) => {
              const neighbor = findTopologyNode(setId, neighborId);
              if (!neighbor) {
                return (
                  <li key={neighborId} className="topology-neighbors__item typo-text-sm">
                    <span className="topology-neighbors__dir">?</span>
                    {neighborId} (미존재)
                  </li>
                );
              }
              const mutual = neighbor.neighborIds.includes(node.id);
              const otherFloor = neighbor.floorName !== node.floorName;
              return (
                <li key={neighborId} className="topology-neighbors__item typo-text-sm">
                  <span className="topology-neighbors__dir" title={mutual ? "양방향" : "단방향"}>
                    {mutual ? "↔" : "→"}
                  </span>
                  {neighbor.displayName}
                  {otherFloor && (
                    <span className="space-detail__label-hint">{neighbor.floorName}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function SpaceDetailPanel({ selection, topologySetId }: SpaceDetailPanelProps) {
  // 선택 id를 레지스트리에서 해석 — 미선택/미등록이면 placeholder
  const space = selection?.kind === "space" ? findSpace(selection.id) : null;
  const facility = selection?.kind === "facility" ? findFacility(selection.id) : null;
  const topologyNode =
    selection?.kind === "topology" && topologySetId
      ? findTopologyNode(topologySetId, selection.id)
      : null;

  return (
    <aside className="space-detail" aria-label="공간/시설물 상세">
      {space ? (
        <SpaceDetail space={space} />
      ) : facility ? (
        <FacilityDetail facility={facility} />
      ) : topologyNode && topologySetId ? (
        <TopologyNodeDetail setId={topologySetId} node={topologyNode} />
      ) : (
        <p className="space-detail__placeholder typo-text-sm">
          평면에서 공간 폴리곤 또는 시설물 마커를 클릭하면
          <br />
          표준 명명 분해와 속성이 여기에 표시됩니다.
        </p>
      )}
    </aside>
  );
}

export default SpaceDetailPanel;
