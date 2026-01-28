const isPreviewFrame = (() => {
  try {
    if (window.self !== window.top) return true;
  } catch (error) {
    return true;
  }
  return new URLSearchParams(window.location.search).has("preview");
})();

const revealTargets = document.querySelectorAll("[data-reveal]");

if (isPreviewFrame) {
  document.body.classList.add("preview-no-animations");
  revealTargets.forEach((el) => el.classList.add("is-visible"));
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    el.style.transform = "translateY(0px)";
  });
}


let observer;
if (!isPreviewFrame) {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

const parallaxTargets = document.querySelectorAll("[data-parallax]");

function updateParallax() {
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || 0;
  parallaxTargets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    if (!parentRect) {
      el.style.transform = "translateY(0px)";
      return;
    }
    if (parentRect.top > viewportHeight || parentRect.bottom < 0) {
      el.style.transform = "translateY(0px)";
      return;
    }
    const extraHeight = rect.height - parentRect.height;
    const maxShift = Math.max(0, extraHeight / 2);
    const total = viewportHeight + parentRect.height;
    const progress = Math.max(0, Math.min(1, (viewportHeight - parentRect.top) / total));
    const offset = maxShift * progress;
    el.style.transform = `translateY(${offset}px)`;
  });
}

if (parallaxTargets.length && !isPreviewFrame) {
  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

const contactForms = document.querySelectorAll(".contact-form[data-mailto]");
contactForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const mailto = form.getAttribute("data-mailto") || "";
    if (!mailto) return;
    const formData = new FormData(form);
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const message = formData.get("message") || "";
    const company = form.getAttribute("data-company") || "your company";
    const subject = `Inquiry for ${company}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      "",
      message ? "Message:" : "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    const mailtoUrl = `mailto:${encodeURIComponent(
      mailto
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  });
});
