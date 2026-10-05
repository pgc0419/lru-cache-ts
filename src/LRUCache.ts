/**
 * LRU (Least Recently Used) Cache
 *
 * - 해시맵(Map<K, Node>)으로 키 → 노드를 O(1)에 찾고
 * - 이중 연결 리스트로 "사용 순서"를 관리한다.
 *     head(센티널) <-> [가장 최근 사용] <-> ... <-> [가장 오래전 사용] <-> tail(센티널)
 *
 * 규칙
 * - get / put 으로 접근한 노드는 맨 앞(head 바로 뒤)으로 이동한다.
 * - 용량을 넘으면 맨 뒤(tail 바로 앞) 노드를 제거한다.
 * - 모든 연산은 O(1). 공간은 O(capacity).
 *
 * ※ Map은 "키 → 노드" 조회에만 쓴다. 순서 관리는 Map의 삽입 순서에 기대지 않고
 *   직접 만든 연결 리스트로 한다.
 */

class Node<K, V> {
  key: K; // 제거 시 map에서도 지우기 위해 노드가 자기 키를 알고 있어야 한다
  value: V;
  // 센티널 덕분에 "리스트에 연결된 노드"의 prev/next는 항상 존재한다.
  // → null을 허용하지 않는 타입으로 선언해 사용처의 null 검사를 없앤다.
  prev: Node<K, V>;
  next: Node<K, V>;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    // 연결 전에는 자기 자신을 가리키게 초기화 (null 대신)
    this.prev = this;
    this.next = this;
  }
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map = new Map<K, Node<K, V>>();
  private readonly head: Node<K, V>; // 데이터 없는 센티널: head.next = 가장 최근
  private readonly tail: Node<K, V>; // 데이터 없는 센티널: tail.prev = 가장 오래전

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError("capacity must be a positive integer");
    }
    this.capacity = capacity;

    // 센티널은 실제 key/value를 갖지 않으므로 타입 단언으로 자리만 채운다.
    this.head = new Node<K, V>(undefined as K, undefined as V);
    this.tail = new Node<K, V>(undefined as K, undefined as V);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /** 현재 저장된 항목 수 */
  get size(): number {
    return this.map.size;
  }

  /** 키가 있으면 값을 반환하고 해당 항목을 "가장 최근 사용"으로 만든다. 없으면 undefined. */
  get(key: K): V | undefined {
    const node = this.map.get(key);
    // 값(0, "", false 등)이 아니라 노드의 존재 여부로 판단해야 한다
    if (node === undefined) return undefined;

    this.moveToFront(node);
    return node.value;
  }

  /**
   * 키-값을 저장한다.
   * - 이미 있는 키: 값을 갱신하고 "가장 최근 사용"으로 만든다. (제거는 일어나지 않음)
   * - 새 키: 맨 앞에 추가하고, 용량을 넘으면 가장 오래전 사용 항목을 제거한다.
   */
  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing !== undefined) {
      existing.value = value;
      this.moveToFront(existing);
      return;
    }

    const node = new Node(key, value);
    this.map.set(key, node);
    this.addToFront(node);

    if (this.map.size > this.capacity) {
      this.evictLeastRecent();
    }
  }

  /** 테스트/디버깅용: 최근 사용 순서(앞 = 가장 최근)로 키 목록을 반환. O(n) */
  keys(): K[] {
    const result: K[] = [];
    for (let node = this.head.next; node !== this.tail; node = node.next) {
      result.push(node.key);
    }
    return result;
  }

  // ---- 내부 헬퍼 (모두 O(1)) ----

  /** 노드를 리스트에서 떼어낸다 (map은 건드리지 않음) */
  private removeNode(node: Node<K, V>): void {
    // 앞뒤 노드가 서로를 가리키게 하면 node는 리스트에서 빠진다.
    // 센티널 덕분에 node가 맨 앞/맨 뒤여도 prev/next가 항상 존재 → 분기 없음
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  /** 노드를 head 바로 뒤(가장 최근 위치)에 붙인다 */
  private addToFront(node: Node<K, V>): void {
    // 순서 주의: 새 노드의 포인터를 먼저 설정한 뒤 기존 연결을 바꾼다.
    // head.next를 먼저 바꾸면 기존 첫 노드를 잃어버린다.
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  private moveToFront(node: Node<K, V>): void {
    this.removeNode(node);
    this.addToFront(node);
  }

  /** 가장 오래전 사용 항목(tail 바로 앞)을 리스트와 map에서 모두 제거 */
  private evictLeastRecent(): void {
    const lru = this.tail.prev;
    if (lru === this.head) return; // 빈 리스트 방어 (capacity >= 1이라 실제로는 도달하지 않음)
    this.removeNode(lru);
    this.map.delete(lru.key); // 노드에 key를 저장해 둔 이유
  }
}
