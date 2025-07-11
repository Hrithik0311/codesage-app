
export interface Theme {
  name: string;
  value: string;
}

export interface ThemeSection {
  title: string;
  themes: Theme[];
}

export const themeSections: ThemeSection[] = [
  {
    title: 'Core',
    themes: [
      { name: "Dark", value: "dark" },
      { name: "Light", value: "light" },
    ],
  },
  {
    title: 'Monochromatic',
    themes: [
      { name: "Mono", value: "mono" },
      { name: "Just Black", value: "just-black" },
      { name: "Black & White", value: "black-white" },
      { name: "Slate", value: "slate" },
      { name: "Dark grey", value: "dark-grey" },
      { name: "Gray", value: "gray" },
      { name: "SlateGray", value: "slategray" },
      { name: "LightSteelBlue", value: "lightsteelblue" },
      { name: "Black Carbon + Silver Metal", value: "black-carbon-silver-metal" },
      { name: "Midnight monochrome", value: "midnight-monochrome" },
      { name: "Slinky Elegant", value: "slinky-elegant" },
    ],
  },
  {
    title: 'Palettes',
    themes: [
      { name: "Oceanic", value: "oceanic" },
      { name: "Ultra Violet", value: "ultra-violet" },
      { name: "Classic Blue", value: "classic-blue" },
      { name: "Banana", value: "banana" },
      { name: "Honeysuckle", value: "honeysuckle" },
      { name: "Rose", value: "rose" },
      { name: "Serenity", value: "serenity" },
      { name: "Sea Foam", value: "sea-foam" },
      { name: "Marsala", value: "marsala" },
      { name: "High Contrast Colorful", value: "high-contrast-colorful" },
      { name: "Pretty in Pink", value: "pretty-in-pink" },
      { name: "Morpheon Dark", value: "morpheon-dark" },
      { name: "Magic Forest Shrooms", value: "magic-forest-shrooms" },
      { name: "Gruvbox Slate", value: "gruvbox-slate" },
      { name: "Aurora", value: "aurora" },
      { name: "Pink Pixel Hearts", value: "pink-pixel-hearts" },
      { name: "Psychedelic Power", value: "psychedelic-power" },
      { name: "Van Gogh Bouquet", value: "van-gogh-bouquet" },
      { name: "Material Dark", value: "material-dark" },
      { name: "CosmicDust STD", value: "cosmic-dust-std" },
      { name: "Purple Pink", value: "purple-pink" },
      { name: "Cardboard Day", value: "cardboard-day" },
      { name: "Color Fusion", value: "color-fusion" },
      { name: "Mountain Lake", value: "mountain-lake" },
      { name: "Catppuccin Macchiato", value: "catppuccin-macchiato" },
    ],
  },
  {
    title: 'Colors',
    themes: [
      { name: "Pink", value: "pink" },
      { name: "Blue", value: "blue" },
      { name: "Green", value: "green" },
      { name: "Orange", value: "orange" },
      { name: "Yellow", value: "yellow" },
      { name: "Lime", value: "lime" },
      { name: "Teal", value: "teal" },
      { name: "Magenta", value: "magenta" },
      { name: "Brown", value: "brown" },
      { name: "Olive", value: "olive" },
      { name: "Navy", value: "navy" },
      { name: "Electric Blue", value: "electric-blue" },
      { name: "PowderBlue", value: "powderblue" },
      { name: "Aquamarine", value: "aquamarine" },
      { name: "DarkTurquoise", value: "darkturquoise" },
      { name: "DarkSlateGray", value: "darkslategray" },
      { name: "DarkOliveGreen", value: "darkolivegreen" },
      { name: "LightBlue", value: "lightblue" },
      { name: "Lavender", value: "lavender" },
      { name: "LightCyan", value: "lightcyan" },
      { name: "Cyan/Aqua", value: "cyan-aqua" },
      { name: "Turquoise", value: "turquoise" },
      { name: "MediumTurquoise", value: "mediumturquoise" },
      { name: "LightSeaGreen", value: "lightseagreen" },
      { name: "CadetBlue", value: "cadetblue" },
      { name: "DarkCyan", value: "darkcyan" },
      { name: "SeaGreen", value: "seagreen" },
      { name: "MediumAquaMarine", value: "mediumaquamarine" },
      { name: "MediumSeaGreen", value: "mediumseagreen" },
    ]
  },
  {
    title: 'Light Tones',
    themes: [
      { name: "Light Lime", value: "light-lime" },
      { name: "Mint", value: "mint" },
      { name: "Mint Cream", value: "mint-cream" },
      { name: "AliceBlue", value: "aliceblue" },
      { name: "GhostWhite", value: "ghostwhite" },
      { name: "Azure", value: "azure" },
    ]
  }
];
