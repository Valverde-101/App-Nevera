const darkGradients = [
  { colors: ['#2a231a', '#1c1a17', '#121316'], locations: [0, 0.55, 1], start: { x: 0.1, y: 0.1 }, end: { x: 0.9, y: 0.9 } },
  { colors: ['#1a212a', '#191d24', '#121316'], locations: [0, 0.6, 1], start: { x: 0.9, y: 0.1 }, end: { x: 0.1, y: 0.9 } },
  { colors: ['#261c2a', '#1e1a24', '#121316'], locations: [0, 0.6, 1], start: { x: 0.2, y: 0.0 }, end: { x: 1.0, y: 0.8 } },
  { colors: ['#1c2422', '#18201e', '#121316'], locations: [0, 0.55, 1], start: { x: 0.0, y: 0.8 }, end: { x: 1.0, y: 0.2 } },
  { colors: ['#241f1a', '#1c1a19', '#121316'], locations: [0, 0.55, 1], start: { x: 0.7, y: 0.0 }, end: { x: 0.0, y: 0.9 } },
  { colors: ['#281a1d', '#1f191b', '#121316'], locations: [0, 0.6, 1], start: { x: 0.0, y: 0.0 }, end: { x: 1.0, y: 1.0 } },
];

const lightGradients = [
  { colors: ['#ffffff', '#fffbd5', '#d1f3ff'], locations: [0, 0.55, 1], start: { x: 0.1, y: 0.1 }, end: { x: 0.9, y: 0.9 } },
  { colors: ['#ffffff', '#d1f3ff', '#fffbd5'], locations: [0, 0.6, 1], start: { x: 0.9, y: 0.1 }, end: { x: 0.1, y: 0.9 } },
  { colors: ['#fffbd5', '#ffffff', '#d1f3ff'], locations: [0, 0.6, 1], start: { x: 0.2, y: 0.0 }, end: { x: 1.0, y: 0.8 } },
  { colors: ['#d1f3ff', '#fffbd5', '#ffffff'], locations: [0, 0.55, 1], start: { x: 0.0, y: 0.8 }, end: { x: 1.0, y: 0.2 } },
  { colors: ['#fffbd5', '#d1f3ff', '#ffffff'], locations: [0, 0.55, 1], start: { x: 0.7, y: 0.0 }, end: { x: 0.0, y: 0.9 } },
  { colors: ['#d1f3ff', '#ffffff', '#fffbd5'], locations: [0, 0.6, 1], start: { x: 0.0, y: 0.0 }, end: { x: 1.0, y: 1.0 } },
];

const hashString = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const gradientForKey = (themeName, key) => {
  const options = themeName === 'light' ? lightGradients : darkGradients;
  return options[hashString(key) % options.length];
};

export const gradients = { dark: darkGradients, light: lightGradients };

export default gradientForKey;
