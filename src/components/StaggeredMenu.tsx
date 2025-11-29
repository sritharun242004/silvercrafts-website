'use client'

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, Menu } from 'lucide-react';

interface MenuItem {
  label: string;
  ariaLabel?: string;
  link?: string;
  onClick?: () => void;
}

interface SocialItem {
  label: string;
  link: string;
}

interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: MenuItem[];
  socialItems?: SocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onLogoClick?: () => void;
  navbarLayout?: 'option1' | 'option2' | 'option3';
  onLoginClick?: () => void;
  onNavigate?: (page: 'home' | 'quote' | 'order') => void;
  loginButtonText?: string;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#B19EEF', '#5227FF'],
  items = [],
  socialItems: _socialItems = [],
  displaySocials: _displaySocials = true,
  displayItemNumbering: _displayItemNumbering = true,
  className,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  isFixed = false,
  accentColor = '#5227FF',
  onMenuOpen,
  onMenuClose,
  onLogoClick,
  navbarLayout = 'option3',
  onLoginClick,
  onNavigate,
  loginButtonText = 'Login'
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const textInnerRef = useRef<HTMLSpanElement>(null);
  const [, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll<HTMLElement>('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set(panel, { xPercent: offscreen, display: 'flex' });
      if (preLayers.length > 0) {
        gsap.set(preLayers, { xPercent: offscreen });
      }

      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
        toggleBtnRef.current.style.color = menuButtonColor;
      }
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector<HTMLElement>('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>('.sm-socials-link'));

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 } as any);
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.08, from: 'start' } } as any,
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemLabel'));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 } as any);

        const socialTitle = panel.querySelector<HTMLElement>('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { 
          color: targetColor, 
          delay: 0.18, 
          duration: 0.3, 
          ease: 'power2.out',
          onUpdate: function() {
            btn.style.color = targetColor;
          }
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
        btn.style.color = menuButtonColor;
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
        toggleBtnRef.current.style.color = targetColor;
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
        toggleBtnRef.current.style.color = menuButtonColor;
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;

    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
      toggleMenu();
    }
  };

  return (
    <div
      className={`sm-scope z-50 ${isFixed ? 'fixed top-0 left-0 w-screen h-screen' : 'w-full h-full'} ${open ? 'overflow-hidden' : ''} ${!open ? 'pointer-events-none' : ''}`}
    >
      <div
        className={(className ? className + ' ' : '') + 'staggered-menu-wrapper relative w-full h-full'}
        style={accentColor ? { ['--sm-accent' as string]: accentColor } : undefined}
        data-position={position}
        data-open={open || undefined}
      >
        {open && (
          <div
            ref={preLayersRef}
            className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
            aria-hidden="true"
          >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
            const arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
          </div>
        )}

        <header
          className="staggered-menu-header absolute top-0 left-0 right-0 w-full flex flex-row items-center justify-between px-4 py-8 sm:px-6 sm:py-10 md:px-12 md:py-12 lg:px-16 lg:py-14 bg-transparent z-50 pointer-events-auto"
          aria-label="Main navigation header"
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
        >
          {navbarLayout === 'option1' && (
            <>
              <button
                onClick={onLoginClick}
                className="text-sm md:text-base font-normal tracking-wide pointer-events-auto hover:opacity-70 transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10"
                style={{ color: menuButtonColor }}
                aria-label={loginButtonText}
              >
                {loginButtonText}
              </button>

              <div 
                className="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer pointer-events-auto group"
                onClick={() => {
                  if (onLogoClick) {
                    onLogoClick();
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <span 
                  className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight transition-opacity duration-200 group-hover:opacity-80"
                  style={{ 
                    color: menuButtonColor,
                    fontFamily: "'Raleway', sans-serif",
                    letterSpacing: '0.02em'
                  }}
                >
                  Silver Crafts<sup className="text-xs ml-0.5" style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</sup>
                </span>
              </div>

              <button
                ref={toggleBtnRef}
                className="sm-toggle relative inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-transparent border-0 cursor-pointer pointer-events-auto transition-all duration-300 rounded-md hover:bg-white/10"
                style={{ color: open ? openMenuButtonColor : menuButtonColor }}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="staggered-menu-panel"
                onClick={toggleMenu}
                type="button"
              >
                <div className="relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                  {open ? (
                    <X className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
                  ) : (
                    <Menu className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
                  )}
                </div>
              </button>
            </>
          )}

          {navbarLayout === 'option2' && (
            <>
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5 pointer-events-auto">
                <button
                  ref={toggleBtnRef}
                  className="sm-toggle relative inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-transparent border-0 cursor-pointer pointer-events-auto transition-all duration-300 rounded-md hover:bg-white/10"
                  style={{ color: open ? openMenuButtonColor : menuButtonColor }}
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                  aria-controls="staggered-menu-panel"
                  onClick={toggleMenu}
                  type="button"
                >
                  <div className="relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                    {open ? (
                      <X className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
                    ) : (
                      <Menu className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
                    )}
                  </div>
                </button>
                
                <div 
                  className="hidden sm:block w-px h-6 opacity-30"
                  style={{ backgroundColor: menuButtonColor }}
                ></div>
                
                <button
                  onClick={onLoginClick}
                  className="text-sm md:text-base font-normal tracking-wide hover:opacity-70 transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10"
                  style={{ color: menuButtonColor }}
                  aria-label={loginButtonText}
                >
                  {loginButtonText}
                </button>
              </div>

              <div 
                className="flex items-center cursor-pointer pointer-events-auto group"
                onClick={() => {
                  if (onLogoClick) {
                    onLogoClick();
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <span 
                  className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight transition-opacity duration-200 group-hover:opacity-80"
                  style={{ 
                    color: menuButtonColor,
                    fontFamily: "'Raleway', sans-serif",
                    letterSpacing: '0.02em'
                  }}
                >
                  Silver Crafts<sup className="text-xs ml-0.5" style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</sup>
                </span>
              </div>
            </>
          )}

          {navbarLayout === 'option3' && (
            <>
              <div 
                className="flex items-center cursor-pointer pointer-events-auto group absolute left-1/2 transform -translate-x-1/2"
            onClick={() => {
              if (onLogoClick) {
                onLogoClick();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <span 
                  className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight transition-opacity duration-200 group-hover:opacity-80"
              style={{ 
                color: menuButtonColor,
                    fontFamily: "'Raleway', sans-serif",
                    letterSpacing: '0.02em'
              }}
            >
                  Silver Crafts<sup className="text-xs ml-0.5" style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</sup>
            </span>
          </div>

              <div className="flex items-center gap-3 sm:gap-4 md:gap-5 pointer-events-auto" style={{ marginLeft: 'auto' }}>
                <button
                  onClick={onLoginClick}
                  className="text-sm md:text-base font-normal tracking-wide hover:opacity-70 transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10"
                  style={{ color: menuButtonColor }}
                  aria-label={loginButtonText}
                >
                  {loginButtonText}
                </button>
                
                <div 
                  className="hidden sm:block w-px h-6 opacity-30"
                  style={{ backgroundColor: menuButtonColor }}
                ></div>

          <button
            ref={toggleBtnRef}
                  className="sm-toggle relative inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-transparent border-0 cursor-pointer pointer-events-auto transition-all duration-300 rounded-md hover:bg-white/10"
            style={{ color: menuButtonColor }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
                  <div className="relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
              {open ? (
                      <X className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
              ) : (
                      <Menu className="w-7 h-7 md:w-8 md:h-8 transition-all duration-300" />
              )}
            </div>
          </button>
              </div>
            </>
          )}
        </header>

        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMenu}
            aria-hidden="true"
          ></div>
        )}
        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className={`staggered-menu-panel fixed top-0 right-0 h-full flex flex-col overflow-y-auto z-50 transition-all duration-400 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ 
            width: 'min(320px, 80vw)',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.5)',
            right: 0,
            left: 'auto',
            backgroundColor: '#1A1A1A'
          }}
          aria-hidden={!open}
        >
          <button
            onClick={toggleMenu}
            className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-white/20 rounded-full hover:border-[#a8bba3] hover:bg-white/10 hover:rotate-90 transition-all duration-200 z-50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          {/* Menu Header */}
          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-wider mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              MENU
            </h2>
            <div className="w-16 h-px bg-[#a8bba3] mx-auto"></div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-1 py-4" role="navigation">
            {items && items.length ? (
              items.map((it, idx) => (
                <div
                  key={it.label + idx}
                  className="group"
                >
                  {it.onClick ? (
                    <button
                      className="w-full text-center px-4 py-3.5 md:py-4 bg-transparent hover:bg-white/5 transition-all duration-200 cursor-pointer min-h-[48px]"
                      onClick={() => handleItemClick(it)}
                      aria-label={it.ariaLabel || it.label}
                    >
                      <span className="text-base md:text-lg font-light text-white/90 tracking-wide group-hover:text-[#a8bba3] transition-colors duration-200" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        {it.label}
                      </span>
                    </button>
                  ) : (
                    <a
                      className="w-full block text-center px-4 py-3.5 md:py-4 bg-transparent hover:bg-white/5 transition-all duration-200 cursor-pointer min-h-[48px]"
                      href={it.link || '#'}
                      aria-label={it.ariaLabel || it.label}
                    >
                      <span className="text-base md:text-lg font-light text-white/90 tracking-wide group-hover:text-[#a8bba3] transition-colors duration-200" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        {it.label}
                      </span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-white/50">No items</div>
            )}
          </nav>
        </aside>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-wrapper[data-open] { pointer-events: auto; }
.sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; right: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; background: transparent; z-index: 50; pointer-events: auto; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
.sm-scope .sm-logo-img { display: block; height: 120px; width: auto; object-fit: contain; }
@media (min-width: 768px) { .sm-scope .sm-logo-img { height: 140px; } }
@media (min-width: 1024px) { .sm-scope .sm-logo-img { height: 160px; } }
.sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.3rem; background: transparent; border: none; cursor: pointer; font-weight: 500; line-height: 1; overflow: visible; transition: color 0.3s ease; }
.sm-scope .sm-toggle:focus-visible { outline: 2px solid #ffffffaa; outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; width: var(--sm-toggle-width, auto); min-width: var(--sm-toggle-width, auto); }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .staggered-menu-panel { position: fixed; top: 0; right: 0; width: clamp(260px, 38vw, 420px); height: 100%; background: white; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 6em 2em 2em 2em; overflow-y: auto; z-index: 50; transform: translateX(100%); margin: 0; }
.sm-scope .staggered-menu-panel.translate-x-0 { transform: translateX(0) !important; }
.sm-scope [data-position='left'] .staggered-menu-panel { transform: translateX(-100%); right: auto; left: 0; }
.sm-scope [data-position='left'] .staggered-menu-panel.translate-x-0 { transform: translateX(0) !important; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(260px, 38vw, 420px); pointer-events: none; z-index: 5; opacity: 0; margin: 0; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(100%); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
.sm-scope .sm-socials { margin-top: auto; padding-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-socials-title { margin: 0; font-size: 1rem; font-weight: 500; color: var(--sm-accent, #ff0000); }
.sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1rem; flex-wrap: wrap; }
.sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
.sm-scope .sm-socials-list .sm-socials-link:hover,
.sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; }
.sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, #ff0000); outline-offset: 3px; }
.sm-scope .sm-socials-link { font-size: 1.2rem; font-weight: 500; color: #111; text-decoration: none; position: relative; padding: 2px 0; display: inline-block; transition: color 0.3s ease, opacity 0.3s ease; }
.sm-scope .sm-socials-link:hover { color: var(--sm-accent, #ff0000); }
.sm-scope .sm-panel-title { margin: 0; font-size: 1rem; font-weight: 600; color: #fff; text-transform: uppercase; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.sm-scope .sm-panel-item { position: relative; color: #000; font-weight: 600; font-size: 2rem; cursor: pointer; line-height: 1; letter-spacing: -1px; text-transform: uppercase; transition: background 0.25s, color 0.25s; display: inline-block; text-decoration: none; padding-right: 3em; }
@media (min-width: 768px) { .sm-scope .sm-panel-item { font-size: 2.5rem; } }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, #ff0000); }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.2em; right: 0.5em; font-size: 14px; font-weight: 400; color: var(--sm-accent, #ff0000); letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 85vw !important; max-width: 400px; right: 0 !important; left: auto !important; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
@media (max-width: 640px) { .sm-scope .staggered-menu-panel { width: 85vw !important; max-width: 400px; right: 0 !important; left: auto !important; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;

