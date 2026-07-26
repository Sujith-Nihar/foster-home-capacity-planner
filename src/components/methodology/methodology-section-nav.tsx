import {
  METHODOLOGY_NAV_ITEMS,
  METHODOLOGY_SCROLL_MARGIN_CLASS,
} from "@/lib/methodology/page-content";

export function MethodologySectionNav() {
  return (
    <nav
      aria-label="Methodology sections"
      className={`methodology-section-nav ${METHODOLOGY_SCROLL_MARGIN_CLASS}`}
    >
      <p className="methodology-section-nav__label">Jump to section</p>
      <ul className="methodology-section-nav__list">
        {METHODOLOGY_NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="methodology-section-nav__link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
