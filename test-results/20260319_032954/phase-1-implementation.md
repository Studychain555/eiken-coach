# Phase 1: 実装検証テスト レポート

**実施日**: 2026-03-19
**所要時間**: 1-2時間

## 1.1 環境・依存関係チェック

- Node.js: v25.6.0
- npm: 11.8.0
- Expo CLI: 未インストール

## 1.2 ファイル構造検証

- ✓ app/_layout.tsx
- ✓ app/(tabs)/_layout.tsx
- ✓ app/(tabs)/index.tsx
- ✓ app/(tabs)/listening.tsx
- ✓ app/(auth)/login.tsx
- ✓ src/lib/audioManager.ts
- ✓ hooks/useAudioPlayer.ts
- ✓ package.json
- ✓ tsconfig.json

## 1.3 TypeScript コンパイルチェック

app/(auth)/_layout.tsx(10,11): error TS2353: Object literal may only specify known properties, and 'animationEnabled' does not exist in type 'ExtendedStackNavigationOptions | ((prop: { route: RouteProp<ParamListBase, string>; navigation: any; }) => ExtendedStackNavigationOptions)'.
app/(auth)/_layout.tsx(17,11): error TS2353: Object literal may only specify known properties, and 'animationEnabled' does not exist in type 'ExtendedStackNavigationOptions | ((prop: { route: RouteProp<ParamListBase, string>; navigation: any; }) => ExtendedStackNavigationOptions)'.
app/(tabs)/index.tsx(158,38): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
app/(tabs)/teacher.tsx(327,45): error TS17001: JSX elements cannot have multiple attributes with the same name.
app/(tabs)/teacher.tsx(362,25): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: ViewProps): View', gave the following error.
    Type '{ width: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
  Overload 2 of 2, '(props: ViewProps, context: any): View', gave the following error.
    Type '{ width: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
app/(tabs)/teacher.tsx(480,77): error TS2322: Type '"listening" | "vocabulary" | "writing"' is not assignable to type '"listening"'.
  Type '"vocabulary"' is not assignable to type '"listening"'.
app/(tabs)/teacher.tsx(940,5): error TS2345: Argument of type '{ container: { flex: number; backgroundColor: string; }; loadingContainer: { flex: number; justifyContent: "center"; alignItems: "center"; }; loadingText: { marginTop: number; color: string; fontSize: number; }; ... 83 more ...; detailValue: { ...; }; }' is not assignable to parameter of type '{ container: { flex: number; backgroundColor: string; }; loadingContainer: { flex: number; justifyContent: "center"; alignItems: "center"; }; loadingText: { marginTop: number; color: string; fontSize: number; }; ... 83 more ...; detailValue: { ...; }; } & NamedStyles<...>'.
  Property 'assignmentListFooter' is incompatible with index signature.
    Object literal may only specify known properties, but 'paddingTopWidth' does not exist in type 'TextStyle | ViewStyle | ImageStyle'. Did you mean to write 'paddingTop'?
app/(tabs)/vocabulary.tsx(272,31): error TS2339: Property 'progressBar' does not exist on type '{ container: { flex: number; backgroundColor: string; }; header: { paddingHorizontal: number; paddingTop: number; paddingBottom: number; }; title: { fontSize: number; fontWeight: "800"; color: string; marginBottom: number; }; ... 54 more ...; resultButtonText: { ...; }; }'.
app/(tabs)/vocabulary.tsx(274,30): error TS2339: Property 'progressFill' does not exist on type '{ container: { flex: number; backgroundColor: string; }; header: { paddingHorizontal: number; paddingTop: number; paddingBottom: number; }; title: { fontSize: number; fontWeight: "800"; color: string; marginBottom: number; }; ... 54 more ...; resultButtonText: { ...; }; }'.
components/EnhancedProgressBar.tsx(143,17): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: TextProps): Text', gave the following error.
    Type '{ textAlign: "center"; flex: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'Falsy | TextStyle | RegisteredStyle<TextStyle> | RecursiveArray<Falsy | TextStyle | RegisteredStyle<TextStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Type '{ textAlign: "center"; flex: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'TextStyle'.
        Types of property 'fontWeight' are incompatible.
          Type 'string' is not assignable to type '"normal" | "800" | "700" | "600" | "400" | "500" | "light" | 100 | 500 | 400 | 200 | "medium" | "bold" | "regular" | "100" | "200" | "300" | "900" | 300 | 600 | 700 | 800 | 900 | "ultralight" | ... 6 more ... | undefined'.
  Overload 2 of 2, '(props: TextProps, context: any): Text', gave the following error.
    Type '{ textAlign: "center"; flex: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'Falsy | TextStyle | RegisteredStyle<TextStyle> | RecursiveArray<Falsy | TextStyle | RegisteredStyle<TextStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Type '{ textAlign: "center"; flex: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'TextStyle'.
        Types of property 'fontWeight' are incompatible.
          Type 'string' is not assignable to type '"normal" | "800" | "700" | "600" | "400" | "500" | "light" | 100 | 500 | 400 | 200 | "medium" | "bold" | "regular" | "100" | "200" | "300" | "900" | 300 | 600 | 700 | 800 | 900 | "ultralight" | ... 6 more ... | undefined'.
components/EnhancedProgressBar.tsx(238,30): error TS2322: Type '{ rotate: string; }' is not assignable to type 'string'.
components/EnhancedProgressBar.tsx(266,19): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: TextProps): Text', gave the following error.
    Type '{ color: string; marginTop: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'StyleProp<TextStyle>'.
      Type '{ color: string; marginTop: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'TextStyle'.
        Types of property 'fontWeight' are incompatible.
          Type 'string' is not assignable to type '"normal" | "800" | "700" | "600" | "400" | "500" | "light" | 100 | 500 | 400 | 200 | "medium" | "bold" | "regular" | "100" | "200" | "300" | "900" | 300 | 600 | 700 | 800 | 900 | "ultralight" | ... 6 more ... | undefined'.
  Overload 2 of 2, '(props: TextProps, context: any): Text', gave the following error.
    Type '{ color: string; marginTop: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'StyleProp<TextStyle>'.
      Type '{ color: string; marginTop: number; fontSize: number; fontWeight: string; lineHeight: number; }' is not assignable to type 'TextStyle'.
        Types of property 'fontWeight' are incompatible.
          Type 'string' is not assignable to type '"normal" | "800" | "700" | "600" | "400" | "500" | "light" | 100 | 500 | 400 | 200 | "medium" | "bold" | "regular" | "100" | "200" | "300" | "900" | 300 | 600 | 700 | 800 | 900 | "ultralight" | ... 6 more ... | undefined'.
components/OptimizedButton.tsx(115,38): error TS2339: Property 'border' does not exist on type '{ background: string; text: string; shadow: { shadowColor: string; shadowOffset: { width: number; height: number; }; shadowOpacity: number; shadowRadius: number; elevation: number; }; } | { background: string; text: string; shadow: { ...; }; } | { ...; } | { ...; } | { ...; } | { ...; }'.
  Property 'border' does not exist on type '{ background: string; text: string; shadow: { shadowColor: string; shadowOffset: { width: number; height: number; }; shadowOpacity: number; shadowRadius: number; elevation: number; }; }'.
src/components/ShadowingScreen.tsx(68,7): error TS2322: Type 'number' is not assignable to type 'Timeout'.
src/components/ShadowingScreen.tsx(69,26): error TS2345: Argument of type '(prev: any) => any' is not assignable to parameter of type 'number'.
src/components/ShadowingScreen.tsx(69,27): error TS7006: Parameter 'prev' implicitly has an 'any' type.
src/components/ShadowingScreen.tsx(134,34): error TS2339: Property 'stopAsync' does not exist on type 'Recording'.
src/components/SkeletonLoader.tsx(138,25): error TS2339: Property 'overlay' does not exist on type '{ container: { paddingHorizontal: number; gap: number; }; itemWrapper: { marginBottom: number; }; card: { backgroundColor: string; borderRadius: number; overflow: "hidden"; }; cardImage: { height: number; backgroundColor: string; }; ... 4 more ...; skeletonLine: { ...; }; }'.
src/components/SkeletonLoader.tsx(139,27): error TS2339: Property 'spinner' does not exist on type '{ container: { paddingHorizontal: number; gap: number; }; itemWrapper: { marginBottom: number; }; card: { backgroundColor: string; borderRadius: number; overflow: "hidden"; }; cardImage: { height: number; backgroundColor: string; }; ... 4 more ...; skeletonLine: { ...; }; }'.
src/components/SkeletonLoader.tsx(140,29): error TS2339: Property 'spinnerDot' does not exist on type '{ container: { paddingHorizontal: number; gap: number; }; itemWrapper: { marginBottom: number; }; card: { backgroundColor: string; borderRadius: number; overflow: "hidden"; }; cardImage: { height: number; backgroundColor: string; }; ... 4 more ...; skeletonLine: { ...; }; }'.
src/components/SkeletonLoader.tsx(141,29): error TS2339: Property 'spinnerDot' does not exist on type '{ container: { paddingHorizontal: number; gap: number; }; itemWrapper: { marginBottom: number; }; card: { backgroundColor: string; borderRadius: number; overflow: "hidden"; }; cardImage: { height: number; backgroundColor: string; }; ... 4 more ...; skeletonLine: { ...; }; }'.
src/components/SkeletonLoader.tsx(142,29): error TS2339: Property 'spinnerDot' does not exist on type '{ container: { paddingHorizontal: number; gap: number; }; itemWrapper: { marginBottom: number; }; card: { backgroundColor: string; borderRadius: number; overflow: "hidden"; }; cardImage: { height: number; backgroundColor: string; }; ... 4 more ...; skeletonLine: { ...; }; }'.
src/components/TeacherAnalytics.tsx(198,13): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: AbstractChartProps & ProgressChartProps): ProgressChart', gave the following error.
    Type '{ labels: string[]; datasets: { data: number[]; }[]; }' is not assignable to type 'ProgressChartData'.
      Property 'data' is missing in type '{ labels: string[]; datasets: { data: number[]; }[]; }' but required in type '{ labels?: string[] | undefined; colors?: string[] | undefined; data: number[]; }'.
  Overload 2 of 2, '(props: AbstractChartProps & ProgressChartProps, context: any): ProgressChart', gave the following error.
    Type '{ labels: string[]; datasets: { data: number[]; }[]; }' is not assignable to type 'ProgressChartData'.
      Property 'data' is missing in type '{ labels: string[]; datasets: { data: number[]; }[]; }' but required in type '{ labels?: string[] | undefined; colors?: string[] | undefined; data: number[]; }'.
src/components/TeacherAnalytics.tsx(241,19): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: ViewProps): View', gave the following error.
    Type '{ width: string; backgroundColor: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
  Overload 2 of 2, '(props: ViewProps, context: any): View', gave the following error.
    Type '{ width: string; backgroundColor: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
src/components/TeacherAnalytics.tsx(295,19): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: ViewProps): View', gave the following error.
    Type '{ width: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
  Overload 2 of 2, '(props: ViewProps, context: any): View', gave the following error.
    Type '{ width: string; }' is not assignable to type 'Falsy | ViewStyle | RegisteredStyle<ViewStyle> | RecursiveArray<Falsy | ViewStyle | RegisteredStyle<ViewStyle>> | readonly (Falsy | ... 1 more ... | RegisteredStyle<...>)[]'.
      Types of property 'width' are incompatible.
        Type 'string' is not assignable to type 'DimensionValue | undefined'.
src/lib/__tests__/securityManager.test.ts(16,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(22,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(25,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(26,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(29,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(32,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(33,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(36,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(40,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(41,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(42,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(43,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(46,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(52,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(55,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(55,40): error TS7006: Parameter 'done' implicitly has an 'any' type.
src/lib/__tests__/securityManager.test.ts(60,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(65,7): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(70,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(76,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(80,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(84,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(87,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(88,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(89,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(92,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(96,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(99,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(103,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(108,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(114,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(119,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(123,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(124,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(125,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(129,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(132,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(135,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(138,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(145,7): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(150,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(154,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(155,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(158,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(159,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(162,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(168,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(171,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(177,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(180,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(183,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(187,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(188,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(192,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(193,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(196,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(199,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(202,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(205,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(208,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(211,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(214,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(217,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(220,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(223,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(226,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(227,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(228,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(231,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(232,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(233,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(237,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(238,3): error TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
src/lib/__tests__/securityManager.test.ts(251,5): error TS2304: Cannot find name 'expect'.
src/lib/__tests__/securityManager.test.ts(252,5): error TS2304: Cannot find name 'expect'.
src/lib/aiScoringService.ts(195,44): error TS2339: Property 'accuracyScore' does not exist on type 'never'.
src/lib/aiScoringService.ts(196,42): error TS2339: Property 'rhythmScore' does not exist on type 'never'.
src/lib/aiScoringService.ts(197,49): error TS2339: Property 'pronunciationScore' does not exist on type 'never'.
src/lib/aiScoringService.ts(198,24): error TS2339: Property 'feedback' does not exist on type 'never'.
src/lib/aiScoringService.ts(199,41): error TS2339: Property 'corrections' does not exist on type 'never'.
src/lib/aiScoringService.ts(199,63): error TS2339: Property 'corrections' does not exist on type 'never'.
src/lib/aiScoringService.ts(356,5): error TS2353: Object literal may only specify known properties, and 'contentScore' does not exist in type 'Promise<{ contentScore: number; structureScore: number; vocabularyScore: number; grammarScore: number; totalScore: number; feedback: string; corrections: { original: string; corrected: string; explanation: string; }[]; modelAnswer: string; }>'.
src/lib/audioManager.enhanced.ts(255,7): error TS2353: Object literal may only specify known properties, and 'cacheSize' does not exist in type '{ totalPlaybacks: number; successfulPlaybacks: number; failedPlaybacks: number; totalRetries: number; averageLoadTime: number; errorCounts: Map<string, number>; }'.
src/lib/errorHandler.ts(94,52): error TS2322: Type 'string' is not assignable to type 'object'.
src/lib/performance.config.ts(84,59): error TS2339: Property 'memory' does not exist on type 'Performance'.
src/lib/performance.config.ts(85,36): error TS2339: Property 'memory' does not exist on type 'Performance'.
src/lib/securityManager.ts(7,26): error TS2307: Cannot find module '@react-native-async-storage/async-storage' or its corresponding type declarations.
src/lib/securityManager.ts(383,5): error TS2322: Type 'number' is not assignable to type 'Timeout'.
src/lib/securityManager.ts(410,58): error TS2554: Expected 1-2 arguments, but got 3.
src/lib/securityManager.ts(434,57): error TS2554: Expected 1-2 arguments, but got 3.
src/lib/securityManager.ts(443,7): error TS2322: Type 'Hmac' is not assignable to type 'string'.
src/lib/sentry.config.ts(6,25): error TS2307: Cannot find module '@sentry/react-native' or its corresponding type declarations.
