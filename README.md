# annabelle - a simple and clean open-source web co-pilot.

This is not yet on the Chrome web store, will update it when available.

## how it works

https://github.com/sunilkumardash9/annabelle/assets/47926185/1ff3d95a-f5da-4a11-8692-281ea55aa274

## Side Panel
 ![Screenshot from 2024-03-25 18-12-58](https://github.com/sunilkumardash9/annabelle/assets/47926185/2b16aa59-6b4c-4872-8c54-dd61c0f9a64c)

## options page for manually adding Key 
![Screenshot from 2024-03-25 18-16-19](https://github.com/sunilkumardash9/annabelle/assets/47926185/07163913-66d7-4dc3-bc86-3a213deacd9a)

## Inference APIs
Currently supports all the inference providers that follows the OpenAI API format such as, Together, Anyscale, etc, and also Google's Gemini.
Multi-modality is exclusively supported via Gemini Pro Vision model for now.

## Getting Started

First, run the development server:

```bash 
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the Chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.


## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

To use it in a Chromium-based browser (Chrome, Edge, Brave, etc.), enable developer mode on the browser, click on load unpacked, select the `build/chrome-mv3-dev` folder in your cloned repository, refresh the pages, and start using the co-pilot.
