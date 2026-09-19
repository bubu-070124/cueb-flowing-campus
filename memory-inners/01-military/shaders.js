/**
 * Patch: 独立质点三维弹道离散扩散算法，彻底告别波纹网格感
 */
export const PointCloudShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uRippleTimes[2];
    uniform vec2 uRippleCenters[2];
    uniform float uRippleStrengths[2];
    uniform float uPointSize;

    attribute vec3 aOrigin;
    attribute float aRandom;
    attribute float aIsCadre;
    attribute float aAngle;
    attribute vec2 aJitterDir;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;

    // 独立粒子三维螺旋花绽算法
    vec3 computeParticleDispersal(vec3 p, vec2 center, float progress, float rippleTime, float randVal, float angleVal) {
      float d = distance(p.xy, center);
      vec2 baseDir = (d > 0.001) ? normalize(p.xy - center) : vec2(0.0, 1.0);

      // 距离衰减半径 (花簇主作用范围)
      float radiusDecay = smoothstep(110.0, 0.0, d);

      // 时间曲线：前 0.0 - 0.35 急速向外绽放，后半程阻尼弹簧极速回聚
      float blastCurve = sin(clamp(progress * 3.14159, 0.0, 3.14159));

      // 单个粒子的离散自由度：每个粒子拥有独立的散角与速度，打破统一网格感
      float individualSpeed = 0.65 + 0.7 * randVal;
      float petalCurve = 0.8 + 0.2 * sin(angleVal * 6.0 + randVal * 3.14);

      // 切向微旋（像被气流冲散的花瓣）
      vec2 twist = vec2(-baseDir.y, baseDir.x) * sin(randVal * 6.28);
      vec2 scatterXY = (baseDir + twist * 0.45 + aJitterDir * 0.6) * blastCurve * radiusDecay * individualSpeed * petalCurve * 36.0;

      // 垂直于地表的立体扬尘高度（让粒子真正脱离平面在空中飞舞）
      float liftZ = sin(progress * 3.14159) * (12.0 + randVal * 16.0) * radiusDecay;

      // 波动涟漪传递
      float waveDist = abs(d - rippleTime * 46.0);
      float rippleRing = smoothstep(16.0, 0.0, waveDist) * exp(-rippleTime * 0.8);
      float ringLift = sin(d * 0.35 - rippleTime * 6.0) * rippleRing * 8.0;

      vec3 totalOffset = vec3(scatterXY.x, scatterXY.y, liftZ + ringLift);

      // 回聚约束：高阻尼弹簧迅速锁回
      if (progress > 0.34) {
        float returnT = smoothstep(0.34, 0.96, progress);
        float springOsc = cos((progress - 0.34) * 16.0) * exp(-(progress - 0.34) * 6.5);
        totalOffset *= (1.0 - returnT + springOsc * 0.18);
      }

      return totalOffset;
    }

    void main() {
      vColor = color;
      vec3 pos = aOrigin;

      // 1. 静止状态：微小独立呼吸（极其微弱，保证画面平整）
      pos.z += sin(uTime * 0.8 + aOrigin.x * 0.04 + aRandom * 6.28) * 0.25;

      vGlow = 0.0;

      // 2. 点击触发：真正的粒子立体飞散与迅速聚拢
      for (int i = 0; i < 2; i++) {
        if (uRippleStrengths[i] > 0.001) {
          float progress = clamp(uRippleTimes[i] / 5.0, 0.0, 1.0);
          vec3 disp = computeParticleDispersal(aOrigin, uRippleCenters[i], progress, uRippleTimes[i], aRandom, aAngle);
          pos += disp * uRippleStrengths[i];

          // 每个点击保留自己的冲击波，后一次不会覆盖前一次
          float d = distance(aOrigin.xy, uRippleCenters[i]);
          float ring = smoothstep(25.0, 0.0, abs(d - uRippleTimes[i] * 46.0));
          vGlow = max(vGlow, ring * uRippleStrengths[i]);
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // 视距微粒微调：清晰而不粗糙
      float viewDist = length(mvPosition.xyz);
      float pSize = uPointSize * (165.0 / viewDist);
      gl_PointSize = clamp(pSize, 1.0, 10.0);

      vAlpha = 1.0;
    }
  `,

  fragmentShader: `
    uniform vec3 uGoldTint;
    uniform vec3 uCrimsonTint;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distSq = dot(coord, coord);
      if (distSq > 0.25) {
        discard;
      }

      float edge = smoothstep(0.25, 0.20, distSq);

      // 关键：加深对比度与色彩深度，压暗发白区域
      vec3 darkened = pow(vColor, vec3(1.22)) * 0.88;

      // 极轻微温和金辉光掠过，绝不过曝
      if (vGlow > 0.01) {
        vec3 tint = mix(uGoldTint, uCrimsonTint, 0.25);
        darkened += tint * vGlow * 0.35;
      }

      gl_FragColor = vec4(darkened, edge);
    }
  `
};
