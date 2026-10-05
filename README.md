# LRU Cache (TypeScript, from scratch)

해시맵 + 이중 연결 리스트로 구현한 용량 제한 LRU 캐시. 모든 연산 O(1).

## 계기
원전 배관 누설 진단 SW(ALMS Viewer)에서 BIN 파일 파싱/STFT 결과를 파일 경로 키로 메모리 캐싱했는데,
프로그램 종료 전까지 유지하는 구조라 폴더 단위로 여러 파일을 열수록 메모리가 계속 늘어나는 한계가 있었다.
→ "무엇을 버릴지"를 정하는 교체 정책(LRU)을 직접 구현.

## 설계
- `Map<K, Node>`: 키 → 노드 O(1) 조회 (순서 관리에는 사용하지 않음)
- 이중 연결 리스트: 사용 순서 관리, 노드 분리/삽입 O(1)
- head/tail 센티널: 경계(맨 앞/맨 뒤) 처리 분기 제거
- `strict: true`: null 가능 포인터를 컴파일 단계에서 검출

## 실행
```bash
npm install
npm test        # vitest
npm run typecheck
```
