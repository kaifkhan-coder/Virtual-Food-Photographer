
export enum PhotoStyle {
  RUSTIC_DARK = 'Rustic/Dark',
  BRIGHT_MODERN = 'Bright/Modern',
  SOCIAL_MEDIA = 'Social Media',
}

export interface Dish {
  name: string;
  description: string;
}

export interface GeneratedImage {
  id: string;
  dishName: string;
  base64: string; // data:image/jpeg;base64,...
}
