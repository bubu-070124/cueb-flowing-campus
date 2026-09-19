/**
 * 回忆态内页 · 楼梯·光
 * 定稿模板：亚像素抖动消摩尔 + 独立粒子三维飞散 + 压暗色调
 */
export const CONFIG = {
  image: {
    src: './stairs-light.jpg',
    sampleWidth: 454,
    sampleHeight: 560,
    fieldPitch: -0.34,
    baseDepthScale: 7.5,
    studentRelief: 2.8,
    reliefMode: 'generic',
  },
  particles: {
    baseSize: 2.1,
    idleFloating: 0.28,
    softGoldTint: [0.88, 0.72, 0.45],
    mutedCrimsonTint: [0.72, 0.22, 0.22]
  },
  interaction: {
    duration: 5.0,
    bloomRadius: 40.0,
    scatterSpread: 1.35
  },
  postprocessing: {
    bloomStrength: 0.12,
    bloomRadius: 0.2,
    bloomThreshold: 0.94,
    exposure: 0.78
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 2000,
    initialPos: [0, -8, 178],
    targetPos: [0, 2, 0]
  }
};
