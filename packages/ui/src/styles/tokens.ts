export const MotionTokens = {
  spring: {
    snappy: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 1,
    },
    smooth: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 1,
    },
    fluid: {
      type: "spring",
      stiffness: 250,
      damping: 30,
      mass: 1,
    },
  },
  easing: {
    easeOutExpo: [0.16, 1, 0.3, 1],
    easeInOutQuint: [0.83, 0, 0.17, 1],
  },
} as const;
