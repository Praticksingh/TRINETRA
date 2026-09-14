# TRINETRA SENTINEL — Phase 12: Motion, Micro-Interactions, and Polish Guidelines

**Document Version:** 1.0.0  
**Date:** September 2026  
**Audience:** Frontend Engineers, UI/UX Designers, SEOC Operation Leads  

---

## 1. Executive Philosophy: Operational Clarity Over Decoration

In high-stakes disaster intelligence platforms like **TRINETRA SENTINEL**, unnecessary motion causes cognitive fatigue and distracts emergency managers from critical hazard alerts.

**Core Motion Rules:**
1. **Motion Explains Forecast Evolution:** Animation is reserved for time-series progressions (e.g. cloudburst convective cell tracking from $T+0$ to $T+6\text{h}$) and user-initiated panel transitions.
2. **Never Animate Continuously Behind Urgent Data:** Background grids, map underlays, and telemetry streams must remain rock-solid and stable.
3. **No Glow as a Substitute for Hierarchy:** Contrast, geometric shape cues (●, ◆, ▲), and typography establish importance; cyan and amber accents provide restrained focal points.
4. **Strict Vestibular Protection:** Full compliance with `prefers-reduced-motion: reduce`. When active, animations collapse to instant state switches (0.01ms) without functional loss.

---

## 2. Transition Durations & Easing Tokens

| Token / Use Case | Duration | Easing Curve | Visual Behavior |
| :--- | :--- | :--- | :--- |
| **Micro-interactions** | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Button press, tab selection, checkbox toggle, icon color shifts. |
| **Drawer Slide-Ins** | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Alert detail drawer, system telemetry drawer, mobile sidebar overlay. |
| **Lead-Time Transitions**| 300ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Timeline scrubber stop changes and hazard intensity curve updates. |
| **Operator Toasts** | 200ms | `ease-out` | Ephemeral notifications sliding in from bottom-right (`slide-in-from-bottom-2`). |
| **Critical Warning Pulse**| 2000ms | `ease-in-out` | Applied *exclusively* to critical unacknowledged warnings (`animate-pulse`). |

---

## 3. Operator Feedback & Toast Notification Standard

Every operator action produces unambiguous, non-disruptive feedback:

```tsx
import { useToast } from "@/components/sentinel";

const { showToast } = useToast();

// 1. SEOC Webhook Dispatch Confirmation
showToast({
  type: "success",
  title: "Advisory Dispatched to SEOC",
  message: "HMAC-SHA256 signed payload sent to UK-SDMA disaster gateway.",
});

// 2. Telemetry Degradation Warning
showToast({
  type: "warning",
  title: "Upstream Telemetry Lagging",
  message: "INSAT-3D TIR1 latency exceeded 30 min threshold. Fallback active.",
});
```

---

## 4. Skeleton Loading Architecture (Zero Layout Shift)

To prevent Cumulative Layout Shift (CLS) when fetching PostGIS predictions:
- `CardSkeleton`: Matches exact bounding box of priority risk cards.
- `TableSkeleton`: Renders proportional row lines matching the Alert Center inbox.
- `MetricsRibbonSkeleton`: Mirrors the 6-item hurdle KPI ribbon.
- All skeletons use dark slate pulses (`bg-[#142235]/60 animate-pulse`) with low visual luminance to preserve night-vision dark adaptation in dimly lit control rooms.

---

## 5. Reduced Motion Audit Verification

All motion utilities are wrapped in the universal CSS reset:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- When tested in browser devtools with `prefers-reduced-motion: reduce`, all pages switch states instantaneously with **zero flashing or disorientation**.
