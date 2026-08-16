# Chakra UI v3 — Component Index
> Generated from `mcp__chakra-ui__list_components` · 2026-06-01
> قبل از ساختن هر کامپوننت: نام رو اینجا چک کن → اگه بود `get_component_example` بزن

## Layout & Primitives
`box` · `flex` · `grid` · `simple-grid` · `stack` · `hstack` · `vstack` · `wrap`
`container` · `center` · `absolute-center` · `aspect-ratio` · `bleed`
`circle` · `square` · `spacer` · `separator` · `sticky`
`portal` · `environment` · `presence` · `focus-trap` · `client-only`
`for` · `show` · `float`

## Typography
`text` · `heading` · `span` · `em` · `strong` · `mark` · `kbd` · `code`
`blockquote` · `quote` · `highlight` · `link` · `list` · `prose`

## Forms & Inputs
`input` · `input-group` · `input-addon` · `input-element`
`textarea` · `number-input` · `pin-input` · `password-input`
`select` · `native-select` · `combobox` · `editable`
`checkbox` · `checkbox-card` · `checkmark`
`radio-group` · `radio` · `radio-card` · `radiomark`
`switch` · `slider` · `rating-group` · `rating`
`segment-group` · `segmented-control` · `toggle`
`tags-input` · `color-picker` · `color-swatch`
`date-picker` · `file-upload`
`field` · `fieldset`

## Buttons & Actions
`button` · `action-bar` · `close-button` · `download-trigger`
`clipboard` · `skip-nav`

## Feedback & Status
`alert` · `badge` · `status` · `spinner` · `loader` · `skeleton`
`progress` · `progress-circle` · `stat` · `steps`
`toast` · `toaster`

## Overlay & Navigation
`dialog` · `drawer` · `popover` · `hover-card` · `floating-panel`
`tooltip` · `overlay` · `menu` · `listbox`
`tabs` · `accordion` · `collapsible`
`breadcrumb` · `pagination` · `scroll-area`

## Display & Media
`avatar` · `icon` · `image` · `card` · `tag`
`table` · `data-list` · `timeline` · `tree-view`
`carousel` · `marquee` · `splitter` · `qr-code`
`empty-state` · `code-block` · `rich-text-editor`
`format` · `locale` · `group`
`visually-hidden`

## Charts (`@chakra-ui/charts`)
`area-chart` · `bar-chart` · `bar-list` · `bar-segment`
`donut-chart` · `line-chart` · `pie-chart`
`radar-chart` · `radial-chart` · `scatter-chart` · `sparkline`

## Theme & Utilities
`theme` · `aspect-ratio` · `color-swatch`

---

## قانون استفاده
1. نام کامپوننت مورد نیاز رو در لیست بالا پیدا کن
2. **اول بخش «Snippets تأییدشده» پایین رو چک کن** — اگه بود، MCP نزن (zero-MCP)
3. نبود → `mcp__chakra-ui__get_component_example` بزن، snippet رو بگیر
4. فقط project-specific adaptation اضافه کن (RTL · token · icon)
5. اگه نبود → از primitives بساز (Box/Flex/Text) — صفر hardcode

---

## Snippets تأییدشده (zero-MCP — RTL/token-adapted)

> از implهای واقعی. این‌ها رو دیگه از MCP نگیر.

### EmptyState
```tsx
import { EmptyState, VStack } from '@chakra-ui/react'
import { FolderPlus } from 'lucide-react'

<EmptyState.Root size="sm">
  <EmptyState.Content>
    <EmptyState.Indicator><FolderPlus /></EmptyState.Indicator>
    <VStack textAlign="center" gap="1">
      <EmptyState.Title>عنوان خالی</EmptyState.Title>
      <EmptyState.Description>توضیح کوتاه</EmptyState.Description>
    </VStack>
  </EmptyState.Content>
</EmptyState.Root>
```

### FileUpload (dropzone)
```tsx
import { FileUpload, Icon, Text } from '@chakra-ui/react'
import { Upload } from 'lucide-react'

<FileUpload.Root accept={['image/png','image/jpeg','image/webp']} maxFiles={1} w="full">
  <FileUpload.HiddenInput />
  <FileUpload.Dropzone w="full" minH="128px" cursor="pointer">
    <Icon color="fg.muted"><Upload size={20} /></Icon>
    <FileUpload.DropzoneContent>
      <Text fontSize="sm" fontWeight="semibold" textAlign="center">برای بارگذاری کلیک کنید</Text>
    </FileUpload.DropzoneContent>
  </FileUpload.Dropzone>
</FileUpload.Root>
```

### Dialog (RTL wrapper)
```tsx
<Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner dir="rtl" py="6">
      <Dialog.Content maxW="512px" w="full" mx="4">
        <Dialog.Header pb="4" pt="6" px="6" position="relative">
          <Dialog.Title fontSize="lg" fontWeight="semibold" textAlign="right" w="full">عنوان</Dialog.Title>
          <Dialog.CloseTrigger asChild position="absolute" top="3" insetEnd="3"><CloseButton size="sm" /></Dialog.CloseTrigger>
        </Dialog.Header>
        <Dialog.Body px="6" pt="2" pb="4">...</Dialog.Body>
        <Dialog.Footer px="6" pt="2" pb="4" justifyContent="flex-end" gap="3">...</Dialog.Footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
```
> close با `insetEnd` (= چپ در RTL). footer `justifyContent="flex-end"` (= سمت چپ، primary leftmost).

### Hover-action row (مثل SubCategoryGrip)
```tsx
const [hover, setHover] = useState(false)
<Flex onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
  bg={hover ? 'teal.subtle' : 'bg.muted'} borderWidth="1px"
  borderColor={hover ? 'teal.focusRing' : 'transparent'} rounded="md">
  {/* محتوا */}
  {hover && <><IconButton.../><IconButton.../></>}  {/* action فقط hover */}
</Flex>
```
> border همیشه 1px (transparent→teal) تا layout shift نشه.
