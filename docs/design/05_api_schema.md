# 05 — API Schema

## 1. API 개요

1차 POC는 실제 백엔드 없이 Mock API 또는 localStorage 기반으로 구현한다. 다만 향후 백엔드 전환을 고려하여 API 경로와 요청/응답 구조를 정의한다.

## 2. Graph API

| Method | Path | 설명 |
|---|---|---|
| GET | /graphs | SOPGraph 목록 조회 |
| GET | /graphs/:graphId | SOPGraph 상세 조회 |
| POST | /graphs | SOPGraph 생성 |
| PUT | /graphs/:graphId | SOPGraph 수정 |
| DELETE | /graphs/:graphId | SOPGraph 삭제 |

## 3. Node Template API

| Method | Path | 설명 |
|---|---|---|
| GET | /node-templates | 사용 가능한 노드 템플릿 조회 |
| GET | /node-templates/:type | 특정 노드 타입 정의 조회 |

## 4. Validation / Compile API

| Method | Path | 설명 |
|---|---|---|
| POST | /graphs/:graphId/validate | 그래프 검증 |
| POST | /graphs/:graphId/compile | ExecutionPlan 생성 |

## 5. Simulation API

| Method | Path | 설명 |
|---|---|---|
| GET | /event-context-samples | 샘플 이벤트 목록 |
| POST | /graphs/:graphId/simulate | 이벤트 입력 후 실행 경로 계산 |

## 6. Runtime Preview API

| Method | Path | 설명 |
|---|---|---|
| GET | /execution-plans/:planId | 실행 계획 조회 |
| POST | /execution-plans/:planId/missions/:missionId/status | 임무 상태 Mock 변경 |
| GET | /execution-plans/:planId/timeline | 실행 타임라인 조회 |

## 7. Domain Template API

| Method | Path | 설명 |
|---|---|---|
| GET | /domain-templates | 도메인 템플릿 목록 |
| GET | /domain-templates/:templateId | 도메인 템플릿 상세 |
| POST | /graphs/from-template/:templateId | 템플릿 기반 SOPGraph 생성 |

## 8. Example: Create Graph

### Request

```json
{
  "name": "가스누출 초동대응 SOPGraph",
  "domain": "plant",
  "version": "0.1.0",
  "nodes": [],
  "edges": []
}
```

### Response

```json
{
  "graphId": "GRAPH-001",
  "name": "가스누출 초동대응 SOPGraph",
  "domain": "plant",
  "version": "0.1.0"
}
```

## 9. Example: Validate Graph

### Request

```json
{
  "nodes": [],
  "edges": []
}
```

### Response

```json
{
  "valid": false,
  "issues": [
    {
      "level": "error",
      "nodeId": "node-sop-001",
      "message": "SOP Group 노드의 trigger 입력 포트가 연결되지 않았습니다."
    }
  ]
}
```

## 10. Example: Simulate Graph

### Request

```json
{
  "eventContext": {
    "eventId": "EVT-SIM-001",
    "eventType": "GAS_LEAK",
    "severity": "WARNING",
    "source": "simulation",
    "occurredAt": "2026-06-23T10:00:00+09:00"
  }
}
```

### Response

```json
{
  "planId": "PLAN-EVT-SIM-001",
  "executionPath": [
    "node-event-001",
    "node-space-001",
    "node-condition-001",
    "node-sop-group-001",
    "node-notification-001",
    "node-branch-001",
    "node-board-001"
  ],
  "missions": [
    {
      "missionId": "MISSION-001",
      "title": "현장 상황 확인",
      "status": "SENT"
    }
  ]
}
```
