import { describe, it, expect } from "vitest";
import { LRUCache } from "../src/LRUCache";

describe("LRUCache 기본 동작", () => {
  it("없는 키는 undefined", () => {
    const c = new LRUCache<string, number>(2);
    expect(c.get("x")).toBeUndefined();
  });

  it("put 후 get", () => {
    const c = new LRUCache<string, number>(2);
    c.put("a", 1);
    expect(c.get("a")).toBe(1);
    expect(c.size).toBe(1);
  });

  it("용량 초과 시 가장 오래전 사용 항목 제거", () => {
    const c = new LRUCache<string, number>(2);
    c.put("a", 1);
    c.put("b", 2);
    c.put("c", 3); // a 제거
    expect(c.get("a")).toBeUndefined();
    expect(c.keys()).toEqual(["c", "b"]);
    expect(c.size).toBe(2);
  });

  it("잘못된 용량은 예외", () => {
    expect(() => new LRUCache(0)).toThrow(RangeError);
    expect(() => new LRUCache(-1)).toThrow(RangeError);
    expect(() => new LRUCache(1.5)).toThrow(RangeError);
  });
});

describe("자소서에 쓴 경계 조건 3가지", () => {
  it("① 이미 있는 키를 갱신하면 값과 순서가 함께 갱신된다 (size는 그대로)", () => {
    const c = new LRUCache<string, number>(2);
    c.put("a", 1);
    c.put("b", 2);
    c.put("a", 10); // a 갱신 → a가 최근
    expect(c.size).toBe(2);
    expect(c.keys()).toEqual(["a", "b"]);
    c.put("c", 3); // b 제거되어야 함
    expect(c.get("b")).toBeUndefined();
    expect(c.get("a")).toBe(10);
  });

  it("② 용량 1에서 교체가 올바르다", () => {
    const c = new LRUCache<string, number>(1);
    c.put("a", 1);
    c.put("b", 2);
    expect(c.get("a")).toBeUndefined();
    expect(c.get("b")).toBe(2);
    expect(c.keys()).toEqual(["b"]);
    c.put("b", 3); // 같은 키 갱신은 제거를 일으키지 않음
    expect(c.get("b")).toBe(3);
    expect(c.size).toBe(1);
  });

  it("③ get으로 조회만 한 항목은 제거 대상에서 밀려난다", () => {
    const c = new LRUCache<string, number>(2);
    c.put("a", 1);
    c.put("b", 2);
    c.get("a"); // a가 최근
    c.put("c", 3); // b 제거
    expect(c.get("a")).toBe(1);
    expect(c.get("b")).toBeUndefined();
    expect(c.keys()).toEqual(["a", "c"]);
  });
});

describe("연결 리스트 무결성", () => {
  it("많은 연산 후에도 map 크기와 리스트 길이가 일치한다", () => {
    const c = new LRUCache<number, number>(50);
    for (let i = 0; i < 10_000; i++) {
      const k = (i * 7919) % 120;
      if (i % 3 === 0) c.get(k);
      else c.put(k, i);
      expect(c.keys().length).toBe(c.size);
      expect(c.size).toBeLessThanOrEqual(50);
    }
  });

  it("value가 undefined/0/falsy여도 '존재'로 처리된다", () => {
    const c = new LRUCache<string, number | undefined>(2);
    c.put("zero", 0);
    expect(c.get("zero")).toBe(0);
  });
});
