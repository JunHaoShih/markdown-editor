import { ShapeType } from './shape';

interface SvgAttribute {
  key: string,
  value: string,
}

export interface IconInfo {
  type: ShapeType,
  name: string,
  viewBox: string,
  path: string,
  svgType: string,
  attributes: SvgAttribute[],
}
