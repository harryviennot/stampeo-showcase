export interface PassField {
  key: string;
  label: string;
  value: string;
}

/**
 * A merchant-uploaded icon with its server-derived variants (mirrors the
 * backend ProcessedIconAsset and the web repo's design types). The preview
 * renders these URLs verbatim, which guarantees parity with the generated
 * strip images.
 */
export interface ProcessedIconAsset {
  id: string;
  original_url: string;
  processed_url: string;
  greyscale_url: string;
  outline_url: string;
  bg_removed: boolean;
}

export type CustomStampEmptyMode = "greyscale" | "outline" | "custom";
export type CustomStampArrangement = "straight" | "staggered";

/**
 * Custom stamp icon configuration (mirrors backend CustomStampConfig).
 * `icons` is the ordered rotation list: stamp slot i renders icons[i % n];
 * the last slot uses reward_icon when set.
 */
export interface CustomStampConfig {
  icons: ProcessedIconAsset[];
  reward_icon?: ProcessedIconAsset | null;
  empty_icon?: ProcessedIconAsset | null;
  empty_mode: CustomStampEmptyMode;
  arrangement: CustomStampArrangement;
}

export type StampIconMode = "preset" | "custom";

export interface CardDesign {
  id: string;
  name: string;
  is_active: boolean;

  // Text
  organization_name: string;
  description: string;
  logo_text?: string;

  // Colors
  foreground_color: string;
  background_color: string;
  label_color: string;

  // Stamp config
  total_stamps: number;
  stamp_filled_color: string;
  stamp_empty_color: string;
  stamp_border_color: string;
  stamp_icon?: string;
  reward_icon?: string;
  icon_color?: string;

  // Custom stamp icons (STA-216)
  stamp_icon_mode?: StampIconMode;
  custom_stamp_config?: CustomStampConfig | null;

  // Asset URLs
  logo_url?: string;
  custom_filled_stamp_url?: string;
  custom_empty_stamp_url?: string;
  strip_background_url?: string;

  // Pass fields
  secondary_fields: PassField[];
  auxiliary_fields: PassField[];
  back_fields: PassField[];

  created_at?: string;
  updated_at?: string;
}

export interface CardDesignCreate {
  name: string;
  organization_name: string;
  description: string;
  logo_text?: string;

  foreground_color?: string;
  background_color?: string;
  label_color?: string;

  total_stamps?: number;
  stamp_filled_color?: string;
  stamp_empty_color?: string;
  stamp_border_color?: string;
  stamp_icon?: string;
  reward_icon?: string;
  icon_color?: string;

  secondary_fields?: PassField[];
  auxiliary_fields?: PassField[];
  back_fields?: PassField[];
}

export type CardDesignUpdate = Partial<CardDesignCreate>;

export interface UploadResponse {
  id: string;
  asset_type: string;
  url: string;
  filename: string;
}
