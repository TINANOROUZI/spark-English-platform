import { useEffect, useRef, useState, type ElementType, type HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & { as?: ElementType };

/** Fades/slides children in once they scroll into view. */
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.14 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <Tag ref={ref} className={`reveal ${visible ? "in" : ""} ${className}`.trim()} {...rest}>{children}</Tag>;
}
