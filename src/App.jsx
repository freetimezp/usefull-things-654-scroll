import { useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Lenis from "lenis";

import ClockTransition from "./components/ClockTransition";

function App() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        const update = () => ScrollTrigger.update();

        const raf = (time) => {
            lenis.raf(time * 1000);
        };

        lenis.on("scroll", update);

        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(raf);
            lenis.off("scroll", update);
            lenis.destroy();
        };
    }, []);

    return (
        <>
            <ClockTransition />
        </>
    );
}

export default App;
