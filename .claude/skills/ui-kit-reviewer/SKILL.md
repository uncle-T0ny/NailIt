---
name: ui-kit-reviewer
description: "TRIGGER IMMEDIATELY after you Edit or Write any .tsx file in mobile/src/screens/ or mobile/src/components/. This is a mandatory post-edit check - run it BEFORE committing, running tests, or marking tasks complete. Verifies NailIt UI kit components are used instead of inline styled primitives. Also trigger during code reviews touching mobile source files."
---

# NailIt UI Kit Reviewer

## Overview

This skill ensures consistent use of the NailIt UI component library. When mobile source files are changed, verify that components from `mobile/src/components/` are used instead of inline styled React Native primitives.

## STRICT POLICY: NO INLINE STYLED PRIMITIVES

**There are NO acceptable exceptions for using inline styled primitives when a UI-kit component exists.**

- If a UI-kit component exists, it MUST be used
- If the component is missing a variant or feature you need, EXTEND THE UI-KIT COMPONENT
- Never justify inline styling with "one-off" or "custom" — add new variants instead

**Forbidden inline patterns** (when UI-kit alternatives exist):

- `<TouchableOpacity>` with button-like styles (paddingVertical, borderRadius, backgroundColor matching COLORS.orange/navy/green) → Use `<Button>`
- `<View>` with card-like styles (backgroundColor: white, borderRadius: 14-16, shadow) → Use `<Card>`
- `<TouchableOpacity>` with chip/pill styles (borderRadius: 20, borderWidth, active state toggle) → Use `<Chip>`
- Raw `<TextInput>` with inline styling (backgroundColor: white, borderRadius: 12) → Use `<NailItTextInput>`
- `<View>` with badge styles (small borderRadius, colored background, white text) → Use `<Badge>`
- `<View style={{flexDirection: 'row'}}` with mascot + title → Use `<ScreenHeader>`
- Inline 3x4 keypad grids → Use `<NumericKeypad>`
- `<View>` with warning/info banner styles (colored row with action) → Use `<Banner>`

**Acceptable raw elements:**
- `<View>` for layout containers (flex rows, spacing)
- `<Text>` for content text
- `<ScrollView>`, `<FlatList>`, `<SafeAreaView>` for scrolling/layout
- `<ActivityIndicator>` for loading states
- `<Pressable>` for custom press interactions (e.g., long-press triggers)

## Workflow

### Step 1: Identify Changed Files

Scan the changed files in `mobile/src/` to identify:
- New components being created
- Existing components being modified
- UI elements being added (buttons, inputs, cards, modals, etc.)

### Step 2: Check UI-Kit Component Usage

**IMPORTANT: Scan the ENTIRE file, not just the changed lines.** Pre-existing violations in the same file are just as important as new ones. If you touch a file, you own all violations in it — fix them all.

For each UI element in the changed files, verify:

1. **Is there an existing UI-kit component?** Check `mobile/src/components/` or the Quick Reference below
2. **Is it imported from `../components`?** The import should be: `import { ComponentName } from '../components';`
3. **Are inline styled primitives used where UI-kit components exist?** Flag violations

### Step 3: Resolve Violations (MANDATORY)

**Every violation MUST be resolved. No exceptions. This includes pre-existing violations found anywhere in the file.**

If a UI-kit component exists but isn't used:

1. Replace the inline styled primitive with the UI-kit component
2. Import from `../components`
3. Apply appropriate variant and props

If a variant or feature is missing:

1. **Do NOT use inline styling as a workaround**
2. **Extend the UI-kit component** by adding the missing variant in `mobile/src/components/`
3. Update the component's props/variants
4. Update the skill documentation (this file + references/components.md)

### Step 4: Create New UI-Kit Components (if needed)

If a new reusable component pattern is introduced:

1. **Create the component** in `mobile/src/components/[ComponentName].tsx`
2. **Export from index** in `mobile/src/components/index.ts`
3. **Add demo section** to `mobile/src/screens/UIKitScreen.tsx`
4. **Update this skill** — add to Quick Reference table below
5. **Update references** — add to `references/components.md`

## Available UI-Kit Components

See `references/components.md` for detailed usage examples.

### Quick Reference

| Component | Import | Use Instead Of |
|-----------|--------|----------------|
| `Button` | `../components` | `<TouchableOpacity>` with button styling (orange/navy/green bg, rounded, shadow) |
| `Card` | `../components` | `<View>` with card styling (white bg, borderRadius 14-16, shadow) |
| `Chip` | `../components` | `<TouchableOpacity>` with pill/chip styling (borderRadius 20, active toggle) |
| `NailItTextInput` | `../components` | Raw `<TextInput>` with inline styles |
| `Badge` | `../components` | `<View>` with small badge styling (colored bg, white text) |
| `ScreenHeader` | `../components` | `<View style={{flexDirection: 'row'}}>` with mascot + title pattern |
| `NumericKeypad` | `../components` | Inline 3x4 keypad grid |
| `Banner` | `../components` | `<View>` with warning/info banner styling |

## File Locations

- **UI-kit components**: `mobile/src/components/`
- **Component exports**: `mobile/src/components/index.ts`
- **Usage examples / demo**: `mobile/src/screens/UIKitScreen.tsx` (hidden screen, long-press NailIt logo)
- **Theme/colors**: `mobile/src/utils/config.ts`
