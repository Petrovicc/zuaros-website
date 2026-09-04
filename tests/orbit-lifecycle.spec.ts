import { test, expect } from "@playwright/test";
import { animateOrbits } from "../src/animation/animateOrbits";
import { particles } from "../src/animation/orbits";

test("RAF, observers and listeners are cleaned up across repeated mounts, visibility and media changes", () => {
  class Source extends EventTarget {
    matches = false;
    hidden = false;
    listeners = new Set<EventListenerOrEventListenerObject>();
    override addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      this.listeners.add(listener);
      super.addEventListener(type, listener);
    }
    override removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      this.listeners.delete(listener);
      super.removeEventListener(type, listener);
    }
  }
  const reduced = new Source(),
    mobile = new Source(),
    doc = new Source();
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  const observers: Observer[] = [];
  class Observer {
    connected = false;
    constructor(
      private callback: (entries: { isIntersecting: boolean }[]) => void,
    ) {
      observers.push(this);
    }
    observe() {
      this.connected = true;
    }
    disconnect() {
      this.connected = false;
    }
    emit(isIntersecting: boolean) {
      this.callback([{ isIntersecting }]);
    }
  }
  const fakeCircle = () => ({
    style: { transform: "" },
    values: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.values.set(name, value);
    },
  });
  const groups = particles.map((particle) => ({
    particle,
    head: fakeCircle(),
    trail: Array.from({ length: 8 }, fakeCircle),
  }));
  const layer = {
    dataset: { motion: "" },
    querySelector(selector: string) {
      const group = groups.find((g) =>
        selector.includes(`"${g.particle.id}"`),
      )!;
      return {
        querySelector: () => group.head,
        querySelectorAll: () => group.trail,
      };
    },
  };
  const replacements = {
    window: {
      matchMedia: (query: string) =>
        query.includes("reduced-motion") ? reduced : mobile,
      IntersectionObserver: Observer,
    },
    document: doc,
    IntersectionObserver: Observer,
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  const saved = Object.keys(replacements).map(
    (name) =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  );
  try {
    for (const [name, value] of Object.entries(replacements))
      Object.defineProperty(globalThis, name, {
        value,
        configurable: true,
        writable: true,
      });
    for (let mount = 0; mount < 10; mount++) {
      const dispose = animateOrbits(
        layer as unknown as SVGGElement,
        {} as HTMLElement,
      );
      expect(frames.size).toBe(0);
      const observer = observers.at(-1)!;
      observer.emit(true);
      expect(frames.size).toBe(1);
      for (const now of [0, 16, 32]) {
        const [id, callback] = [...frames.entries()][0];
        frames.delete(id);
        callback(now);
        expect(frames.size).toBe(1);
      }
      doc.hidden = true;
      doc.dispatchEvent(new Event("visibilitychange"));
      expect(frames.size).toBe(0);
      expect(layer.dataset.motion).toBe("paused");
      doc.hidden = false;
      doc.dispatchEvent(new Event("visibilitychange"));
      expect(frames.size).toBe(1);
      reduced.matches = true;
      reduced.dispatchEvent(new Event("change"));
      expect(frames.size).toBe(0);
      expect(layer.dataset.motion).toBe("reduced");
      reduced.matches = false;
      reduced.dispatchEvent(new Event("change"));
      mobile.matches = !mobile.matches;
      mobile.dispatchEvent(new Event("change"));
      expect(frames.size).toBe(1);
      observer.emit(false);
      expect(frames.size).toBe(0);
      observer.emit(true);
      const queuedCallback = [...frames.values()][0];
      dispose();
      expect(frames.size).toBe(0);
      expect(observer.connected).toBe(false);
      for (const source of [reduced, mobile, doc])
        expect(source.listeners.size).toBe(0);
      // A late browser callback cannot restart a disposed controller.
      queuedCallback(48);
      expect(frames.size).toBe(0);
    }
    expect(observers.every((observer) => !observer.connected)).toBe(true);
  } finally {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});
