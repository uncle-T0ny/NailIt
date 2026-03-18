# NailIt UI Kit — Component Reference

## Button

Pressable button with 5 variants.

### Import
```tsx
import { Button } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'small' \| 'text'` | `'primary'` | Visual style |
| `onPress` | `() => void` | required | Press handler |
| `disabled` | `boolean` | `false` | Disables press + reduces opacity |
| `loading` | `boolean` | `false` | Shows ActivityIndicator instead of text |
| `children` | `ReactNode` | required | Button content (string or custom) |
| `style` | `ViewStyle` | — | Override/extend styles (e.g., margins) |

### Variants
```tsx
// Primary — orange bg, shadow, used for main CTAs
<Button variant="primary" onPress={handlePress}>Collect Payment</Button>

// Secondary — navy bg, used for secondary actions
<Button variant="secondary" onPress={handlePress}>Done</Button>

// Success — green bg, used for positive actions
<Button variant="success" onPress={handlePress}>Send Receipt</Button>

// Small — compact navy, used for inline actions
<Button variant="small" onPress={handlePress}>CSV</Button>

// Text — no background, used for cancel/dismiss
<Button variant="text" onPress={handlePress}>Cancel</Button>

// Disabled state
<Button variant="primary" onPress={handlePress} disabled>Disabled</Button>

// Loading state
<Button variant="success" onPress={handlePress} loading>Sending...</Button>
```

---

## Card

Container with white background, rounded corners, and shadow.

### Import
```tsx
import { Card } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'transaction'` | `'default'` | Card style |
| `children` | `ReactNode` | required | Card content |
| `centered` | `boolean` | `false` | Centers content horizontally |
| `style` | `ViewStyle` | — | Override/extend styles |

### Variants
```tsx
// Default — larger padding and shadow
<Card centered style={{ marginHorizontal: 20 }}>
  <Text>Content here</Text>
</Card>

// Transaction — compact, lighter shadow, includes marginBottom
<Card variant="transaction">
  <Text>$150.00</Text>
</Card>
```

---

## Chip

Selectable pill/chip for filter bars and option selectors.

### Import
```tsx
import { Chip } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Display text |
| `active` | `boolean` | required | Selected state |
| `onPress` | `() => void` | required | Press handler |
| `activeColor` | `'orange' \| 'navy'` | `'orange'` | Background color when active |
| `style` | `ViewStyle` | — | Override/extend styles |

### Usage
```tsx
// Orange active — for template/item selection
<Chip label="Framing" active={selected === 'Framing'} onPress={() => setSelected('Framing')} activeColor="orange" />

// Navy active — for category/filter selection
<Chip label="Labor" active={filter === 'labor'} onPress={() => setFilter('labor')} activeColor="navy" />

// In a horizontal FlatList
<FlatList
  horizontal
  data={items}
  renderItem={({ item }) => (
    <Chip label={item.label} active={selected === item.key} onPress={() => setSelected(item.key)} />
  )}
/>
```

---

## NailItTextInput

Styled text input with consistent look.

### Import
```tsx
import { NailItTextInput } from '../components';
```

### Props
All standard React Native `TextInput` props, except `placeholderTextColor` (auto-set to `COLORS.gray`).

### Usage
```tsx
// Default text input
<NailItTextInput
  placeholder="e.g., Framing - 45 Elm St"
  value={description}
  onChangeText={setDescription}
/>

// Phone input
<NailItTextInput
  placeholder="Customer phone (optional)"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>

// With style override
<NailItTextInput
  placeholder="Centered input"
  style={{ textAlign: 'center', marginBottom: 12 }}
/>
```

---

## Badge

Small colored label for categories and statuses.

### Import
```tsx
import { Badge } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'category' \| 'status'` | required | Badge type |
| `label` | `string` | required | Display text |
| `color` | `string` | `COLORS.navy` | Background color (category variant) |
| `style` | `ViewStyle` | — | Override/extend styles |

### Usage
```tsx
// Category badge with custom color
<Badge variant="category" label="Labor" color="#3B82F6" />
<Badge variant="category" label="Materials" color="#F59E0B" />

// Status badge — auto-colors green for "Completed", orange otherwise
<Badge variant="status" label="Completed" />
<Badge variant="status" label="Pending" />

// With positioning override
<Badge variant="status" label="Completed" style={{ position: 'absolute', top: 12, right: 12 }} />
```

---

## ScreenHeader

Header row with mascot, title, and optional right action.

### Import
```tsx
import { ScreenHeader } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Header text |
| `mascot` | `ReactNode` | — | Naily mascot component |
| `rightAction` | `ReactNode` | — | Right-side action (e.g., Button) |
| `centered` | `boolean` | `false` | Center-aligns content |
| `style` | `ViewStyle` | — | Override/extend styles |

### Usage
```tsx
// Simple header
<ScreenHeader title="New Payment" mascot={<NailyReady size={60} />} />

// Centered header (e.g., HomeScreen)
<ScreenHeader title="NailIt" mascot={<NailyWave size={56} />} centered />

// With right action
<ScreenHeader
  title="History"
  mascot={<NailyClipboard size={60} />}
  rightAction={<Button variant="small" onPress={handleExport}>CSV</Button>}
/>
```

---

## NumericKeypad

3x4 numeric grid with decimal point and backspace.

### Import
```tsx
import { NumericKeypad } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onKeyPress` | `(key: string) => void` | required | Key press handler |

### Usage
```tsx
<NumericKeypad onKeyPress={(key) => {
  // key is '0'-'9', '.', or '⌫'
  handleKeyPress(key);
}} />
```

---

## Banner

Info or warning banner with optional icon and action button.

### Import
```tsx
import { Banner } from '../components';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'warning' \| 'info'` | `'warning'` | Background color style |
| `icon` | `ReactNode` | — | Left icon (e.g., Naily mascot) |
| `children` | `ReactNode` | required | Banner content (string or custom) |
| `action` | `{ label: string; onPress: () => void }` | — | Right action button |
| `style` | `ViewStyle` | — | Override/extend styles |

### Usage
```tsx
// Warning banner with action
<Banner
  variant="warning"
  icon={<NailyOffline size={40} />}
  action={{ label: 'Sync Now', onPress: handleSync }}
>
  2 payments pending sync
</Banner>

// Info banner without action
<Banner variant="info" icon={<NailySyncing size={40} />}>
  Syncing transactions...
</Banner>
```
