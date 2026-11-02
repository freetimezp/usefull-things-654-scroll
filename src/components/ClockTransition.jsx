import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const labels = Array.from({ length: 12 }, () => "(Format)");

const DOT_SIZE = 40;
const DOT_RADIUS_RATIO = 0.38;

const DOT_START_ANGLE = -30;
const IMPACT_ANGLE = -30;
const DOT_END_ANGLE = 90;

const DOT_OFFSET_Y = 8;

const IMPACT_AT = 2.25;
const DOT_TRAVEL_DUR = 1.85;
const HAND_FINISH_AT = 4.8;
const DOT_MOVEMENT_DUR = 1.25;

const PRE_SCALE = 3;
const END_BOOST = 1.7;
const CORE_COVER_MARGIN = 1.15;

const EXPAND_AT = IMPACT_AT + DOT_TRAVEL_DUR;
const COVERED_AT = EXPAND_AT + 4.7;

const WHITE_START_ANGLE = -30;

const WHITE_AT =
    IMPACT_AT +
    DOT_TRAVEL_DUR *
        ((WHITE_START_ANGLE - DOT_START_ANGLE) /
            (DOT_END_ANGLE - DOT_START_ANGLE));

const ClockTransition = () => {
    const containerRef = useRef(null);
    const clockRef = useRef(null);
    const handRef = useRef(null);
    const labelRefs = useRef([]);

    const dotRef = useRef(null);
    const whiteCircleRef = useRef(null);
    const innerBlackRef = useRef(null);

    const nextSectionRef = useRef(null);
    const nextContentRef = useRef(null);

    useGSAP(
        () => {
            const clock = clockRef.current;
            const hand = handRef.current;
            const dot = dotRef.current;

            const whiteCircle = whiteCircleRef.current;
            const innerBlack = innerBlackRef.current;
            const nextSection = nextSectionRef.current;
            const nextContent = nextContentRef.current;

            const getClockSize = () => clock.offsetWidth;
            const getDotRadius = () => getClockSize() * DOT_RADIUS_RATIO;
            const getRiseDistance = () => getDotRadius() + DOT_OFFSET_Y;

            const getFinalClockY = () =>
                -getRiseDistance() -
                clock.offsetHeight -
                window.innerHeight * 0.2;

            const getHalfDiagonal = () =>
                Math.hypot(window.innerWidth / 2, window.innerHeight / 2);

            const getEndScale = () =>
                ((getHalfDiagonal() * 2.15) / DOT_SIZE) * END_BOOST;

            const getCoreEnd = () =>
                (2 * getHalfDiagonal() * CORE_COVER_MARGIN) /
                (DOT_SIZE * getEndScale());

            const motion = {
                dotAngle: DOT_START_ANGLE,
                handAngle: -90,
                rise: 0,
                extraClockRise: 0,
            };

            const INACTIVE_COLOR = 190;
            const ACTIVE_COLOR = 15;
            const HIGHLIGHT_RANGE = 32;

            const updateLabels = () => {
                labelRefs.current.forEach((label, index) => {
                    if (!label) return;

                    const labelAngle = index * 30 - 90;

                    const difference = Math.abs(
                        ((motion.handAngle - labelAngle + 540) % 360) - 180,
                    );

                    const proximity = gsap.utils.clamp(
                        0,
                        1,
                        1 - difference / HIGHLIGHT_RANGE,
                    );

                    const intensity =
                        proximity * proximity * (3 - 2 * proximity);

                    const channel = Math.round(
                        INACTIVE_COLOR +
                            (ACTIVE_COLOR - INACTIVE_COLOR) * intensity,
                    );

                    label.style.color = `rgb(${channel}, ${channel}, ${channel})`;
                });
            };

            const updatePositions = () => {
                const angle = (motion.dotAngle * Math.PI) / 180;

                const radius = getDotRadius();

                gsap.set(clock, {
                    y: -motion.rise - motion.extraClockRise,
                });

                gsap.set(dot, {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius - motion.rise + DOT_OFFSET_Y,
                });
            };

            gsap.set(clock, {
                transformOrigin: "50% 50%",
            });

            gsap.set(hand, {
                rotation: -90,
                transformOrigin: "left center",
            });

            gsap.set(dot, {
                xPercent: -50,
                yPercent: -50,
                scale: 0,
                autoAlpha: 0,
                transformOrigin: "50% 50%",
            });

            gsap.set([whiteCircle, innerBlack], {
                scale: 0,
                transformOrigin: "50% 50%",
            });

            gsap.set(nextSection, {
                autoAlpha: 0,
            });

            updatePositions();
            updateLabels();

            const tl = gsap.timeline({
                defaults: { ease: "none" },

                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=405%",
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            // 1
            tl.to(
                hand,
                {
                    rotation: IMPACT_ANGLE,
                    duration: IMPACT_AT,
                    ease: "none",
                },
                0,
            );

            tl.to(
                motion,
                {
                    handAngle: IMPACT_ANGLE,
                    duration: IMPACT_AT,
                    ease: "none",
                    onUpdate: updateLabels,
                },
                0,
            );

            // 2
            tl.to(
                dot,
                {
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.25,
                    ease: "power2.out",
                },
                1.65,
            );

            // 3
            tl.to(
                motion,
                {
                    dotAngle: DOT_END_ANGLE,
                    duration: DOT_MOVEMENT_DUR,
                    ease: "none",
                    onUpdate: updatePositions,
                },
                IMPACT_AT,
            );

            tl.to(
                hand,
                {
                    rotation: 90,
                    duration: HAND_FINISH_AT - IMPACT_AT,
                    ease: "none",
                },
                IMPACT_AT,
            );

            tl.to(
                motion,
                {
                    handAngle: 90,
                    duration: HAND_FINISH_AT - IMPACT_AT,
                    ease: "none",
                    onUpdate: updateLabels,
                },
                IMPACT_AT + 0.5,
            );

            // 4
            tl.to(
                motion,
                {
                    rise: getRiseDistance,
                    duration: DOT_TRAVEL_DUR,
                    ease: "none",
                    onUpdate: updatePositions,
                },
                IMPACT_AT,
            );

            tl.to(
                motion,
                {
                    extraClockRise: () => -getFinalClockY() - getRiseDistance(),
                    duration: 3.2,
                    ease: "none",
                    onUpdate: updatePositions,
                },
                EXPAND_AT,
            );

            // 5

            tl.to(
                dot,
                {
                    scale: PRE_SCALE,
                    duration: DOT_TRAVEL_DUR,
                    ease: "none",
                },
                IMPACT_AT,
            );

            // 6

            tl.to(
                dot,
                {
                    scale: getEndScale,
                    duration: COVERED_AT - EXPAND_AT,
                    ease: "power2.inOut",
                },
                EXPAND_AT,
            );

            tl.to(
                whiteCircle,
                {
                    scale: 0.73,
                    duration: 1.5,
                    ease: "power2.inOut",
                },
                WHITE_AT,
            );

            tl.to(
                innerBlack,
                {
                    scale: 0.48,
                    duration: 2.45,
                    ease: "power2.inOut",
                },
                EXPAND_AT + 0.7,
            );

            tl.to(
                innerBlack,
                {
                    scale: getCoreEnd,
                    duration: COVERED_AT - (EXPAND_AT + 3.2),
                    ease: "power2.inOut",
                },
                EXPAND_AT + 3.2,
            );

            // 7

            tl.set(
                nextSection,
                {
                    autoAlpha: 1,
                },
                COVERED_AT,
            );

            tl.fromTo(
                nextContent,
                {
                    y: () => window.innerHeight * 0.75,
                },
                {
                    y: 0,
                    duration: 1.4,
                    ease: "power3.out",
                    immediateRender: false,
                },
                COVERED_AT,
            );

            tl.to({}, { duration: 0.4 }, COVERED_AT + 1.4);
        },
        { scope: containerRef },
    );

    return (
        <div className="w-full bg-[#d8d8d8] text-black">
            <section className="h-screen w-full flex flex-col justify-center items-center p-8 bg-[#e3e3e3]">
                <h1 className="mb-4 text-6xl md:text-8xl font-black uppercase tracking-tighter">
                    Horizontal
                </h1>

                <p className="text-lg md:text-xl text-neutral-600 font-mono text-center">
                    Scroll down to see animation
                </p>
            </section>

            <div
                ref={containerRef}
                className="relative isolate w-full h-screen overflow-hidden flex items-center justify-center bg-[#d8d8d8]"
            >
                <div
                    ref={clockRef}
                    className="
                        absolute z-10
                        w-[min(650px,90vw)]
                        aspect-square
                        rounded-full
                        bg-white
                        shadow-2xl
                        flex items-center justify-center
                    "
                >
                    {labels.map((text, idx) => (
                        <div
                            key={idx}
                            className="absolute inset-0 flex items-start justify-center pointer-events-none"
                            style={{ transform: `rotate(${idx * 30}deg)` }}
                        >
                            <span
                                ref={(el) => {
                                    labelRefs.current[idx] = el;
                                }}
                                className="
                                    absolute
                                    top-[6%]
                                    left-1/2
                                    text-[9px]
                                    sm:text-[11px]
                                    md:text-[12px]
                                    font-sans
                                    font-medium
                                    whitespace-nowrap
                                "
                                style={{
                                    color: "#bebebe",
                                    transform: "translateX(-50%) rotate(90deg)",
                                    transformOrigin: "center center",
                                }}
                            >
                                {text}
                            </span>
                        </div>
                    ))}

                    <div className="absolute z-20 w-3 h-3 bg-black rounded-full" />

                    <div
                        ref={handRef}
                        className="absolute z-10 top-1/2 left-1/2 h-0.5 w-[38%] bg-black origin-left"
                    />
                </div>

                <div
                    ref={dotRef}
                    className="absolute z-20 left-1/2 top-1/2 w-10 h-10 rounded-full bg-black pointer-events-none"
                >
                    <div
                        ref={whiteCircleRef}
                        className="absolute inset-0 rounded-full  bg-white"
                    />

                    <div
                        ref={innerBlackRef}
                        className="absolute inset-0 rounded-full bg-[#121212]"
                    />
                </div>

                <div
                    ref={nextSectionRef}
                    className="absolute inset-0 z-40 bg-[#121212] text-white flex items-center justify-center p-8 md:p-12 invisible"
                >
                    <div ref={nextContentRef} className="max-w-3xl space-y-6">
                        <span className="text-sm uppercase tracking-widest text-neutral-400 font-mono">
                            02 / 04 - The Exp.
                        </span>

                        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                            Smart Clock
                        </h2>

                        <p className="text-neutral-400 text-lg leading-relaxed font-light">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Iure dolor modi perferendis ad doloremque
                            dolores asperiores necessitatibus natus, quod et
                            deserunt! Dicta, iste excepturi.
                        </p>
                    </div>
                </div>
            </div>

            <section className="min-h-screen bg-[#121212] text-white p-12 flex items-center justify-center">
                <p className="font-mono text-neutral-500 uppercase tracking-widest">
                    End transition
                </p>
            </section>
        </div>
    );
};

export default ClockTransition;
