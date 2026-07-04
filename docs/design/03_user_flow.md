# 03 — User Flow

## 1. 사용자 흐름 개요

수정된 1차 POC는 기존의 목록/상세 중심 흐름이 아니라, 자유 캔버스에서 노드를 배치하고 연결하여 SOPGraph를 생성하는 흐름을 중심으로 한다.

## Flow 1. Graph Studio 진입

1. 사용자는 Visual SOP Graph Studio에 접속한다.
2. 화면 중앙에는 무한 캔버스가 표시된다.
3. 좌측에는 Node Palette가 표시된다.
4. 우측에는 Property Inspector가 표시된다.
5. 하단에는 Validation / Compile Panel이 표시된다.

## Flow 2. 노드 추가

1. 사용자는 좌측 Node Palette에서 노드 유형을 선택한다.
2. 노드를 캔버스로 드래그앤드롭한다.
3. 시스템은 해당 노드 유형의 기본 속성과 포트를 가진 GraphNode를 생성한다.
4. 사용자는 노드를 자유롭게 이동하여 배치한다.

예시 노드: Sensor Event, Space Scope, Asset Filter, Condition, SOP Group, Notification, Branch, Situation Board

## Flow 3. 노드 연결

1. 사용자는 Event Node의 output port를 Space Scope Node의 input port에 연결한다.
2. Space Scope Node의 output port를 Condition Node에 연결한다.
3. Asset Filter Node를 Condition Node에 연결한다.
4. Condition Node의 true output을 SOP Group Node에 연결한다.
5. SOP Group Node를 Notification Node에 연결한다.
6. Notification Node를 Branch Node에 연결한다.
7. Branch Node를 Situation Board Node에 연결한다.

```text
Event → Space Scope → Asset Filter → Condition → SOP Group → Notification → Branch → Situation Board
```

## Flow 4. 노드 속성 편집

1. 사용자는 캔버스에서 노드를 클릭한다.
2. 우측 Property Inspector에 선택 노드의 속성이 표시된다.
3. 사용자는 이벤트 유형, 조건식, 담당자, 제한시간, 전파채널 등을 수정한다.
4. 변경 내용은 GraphNode의 properties에 반영된다.

## Flow 5. 복합 SOP Group 작성

1. 사용자는 SOP Group Node를 추가한다.
2. SOP Group을 펼친다.
3. 내부에 SOP Task Node를 여러 개 추가한다.
4. Task 간 순서를 연결한다.
5. 각 Task에 담당 Role, 완료 조건, 제한 시간을 설정한다.
6. SOP Group을 접으면 하나의 복합 노드로 표시된다.

## Flow 6. 그래프 검증

1. 사용자는 Validate 버튼을 클릭한다.
2. 시스템은 필수 포트 연결 여부를 확인한다.
3. 필수 속성 누락 여부를 확인한다.
4. 잘못된 포트 타입 연결을 확인한다.
5. 순환 참조 또는 도달 불가능 노드를 확인한다.
6. 하단 Validation Panel에 결과를 표시한다.

## Flow 7. SOPGraph 컴파일

1. 사용자는 Compile 버튼을 클릭한다.
2. 시스템은 React Flow nodes/edges를 SOPGraph JSON으로 변환한다.
3. SOPGraph JSON Preview를 표시한다.
4. 컴파일 성공 시 Runtime Preview 실행이 가능해진다.

## Flow 8. EventContext 시뮬레이션

1. 사용자는 샘플 EventContext를 선택한다.
2. 시스템은 Event Node와 EventContext를 매칭한다.
3. Condition Node를 평가한다.
4. 실행 가능한 경로를 계산한다.
5. 캔버스에서 실행 경로를 하이라이트한다.

## Flow 9. Runtime Preview

1. 실행 경로를 기준으로 임무가 생성된다.
2. Notification Node에서 전파 메시지 Mock이 생성된다.
3. Branch Node에서 응답/미응답 분기가 표시된다.
4. Situation Board Node에 기록될 내용이 표시된다.
5. 사용자는 실제 실행 전 SOPGraph의 동작을 확인한다.

## Flow 10. 도메인 템플릿 불러오기

1. 사용자는 Template Library를 연다.
2. 액화수소 플랜트, 발전소, 안전한국훈련, 일반 사업장 안전 템플릿 중 하나를 선택한다.
3. 선택한 템플릿은 SOPGraph 초안으로 캔버스에 배치된다.
4. 사용자는 도메인별 공간, 객체, 조건, 담당자만 수정한다.
