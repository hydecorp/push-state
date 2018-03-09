## Loading

✓ Expressed Dependencies — Does the component import or otherwise load all of its own dependencies?

Yes. The lite version does not include polyfills.
Can be used via webpack/browserify to avoid loading RxJS twice when already using it.

✓ Load Order Independence — Can you load the component at any point?

Yes.

✓ Relative Paths — Are all paths relative to required resources (images, etc.) relative to the component source?

Yes.

## DOM Presence

✓ Plain Tag — Can you instantiate the component with just a plain tag (`<my-element>`)?

Kinda. Won't throw an error, and has some heuristics to deal with it. But really, the component needs an `id`, or even better have the `replace-ids` attribute set properly.

✓ Parent/Child Independence — Can you use the component inside any type of parent element, or with any type of child elements?

Yes.

✓ Declared Semantics — Does the component expose its semantics by wrapping/extending a native element, or using ARIA roles, states, and properties? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

NA

✓ Meaningful Structure — Does the component's DOM structure reflect the meaningful relationship between elements, such that those relationships are clear to a user relying on an assistive device? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ Labels — Are the component's significant elements labeled such that a user relying on an assistive device can understand what those elements are for? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ Local Effects — Does the component limit its effects to itself (or a designated target element)?

✓ Detached Instantiation — Can the component be instantiated without being part of the document?

✓ [Detachment](Detachment) — If the component is detached, does it stop listening to page events, and generally suspend non-essential tasks?

✓ [Reattachment](Reattachment) — Can a detached component be added back to the page?



## Content

✓ [Children Visible](Children-Visible) — If the component is visible and given an initial set of children, are those children visible without any attributes, methods, event handlers, or styles required?

✓ [Content Assignment](Content-Assignment) — Can you place a `<slot>` element inside a component instance and have the component treat the assigned content as if it were directly inside the component?

✓ [Content Changes](Content-Changes) — Will the component respond to runtime changes in its content (including distributed content)?

✓ [Child Independence](Child-Independence) — Can you use the component with a wide range of child element types?

✓ [Auxiliary Content](Auxiliary-Content) — Does the component permit the use of child elements that perform auxiliary functions?

✓ [Back-End Independence](Back-End-Independence) — Can the component retrieve its content from a variety of a back-end services?



## <a name="Interaction"></a>Interaction

✓ [Focusable](Focusable) — If the component is interactive, can you navigate to/through it with Tab and Shift+Tab? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Keyboard Support](Keyboard-Support) — Can you use the basic aspects of component exclusively with the keyboard? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Redundant Sound](Redundant-Sound) — If the component uses sound to communicate information,
does it also provide the same information another way? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)



## <a name="Styling"></a>Styling

✓ [Presentable](Presentable) — If the component is instantiated with no explicit styling, is it reasonably attractive, such that someone could feel comfortable presenting it as is?

✓ [Generic Styling](Generic-Styling) — Generally speaking, is the component’s default appearance straightforward and subdued?

✓ [Informational Animation](Informational-Animation) — Does the component’s default styling only use animation to communicate visually what is happening, rather than for purely artistic effects?

✓ [Default Font](Default-Font) — By default, does the component use the inherited font face, size, style, and weight?

✓ [Default Colors](Default-Colors) — By default, does the component make use of the inherited forecolor and backcolor?

✓ [Focus Visible](Focus-Visible) — Can you easily see when the component has focus? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Redundant Color](Redundant-Color) — If the component uses color to communicate information, does it also provide the same information another way? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Size to Content](Size-to-Content) — Does the component automatically size itself to contain its content by default?

✓ [Stretch to Fit](Stretch-to-Fit) — If you stretch the component (e.g., with absolute positioning or CSS flex), do its elements appropriately stretch as well?

✓ [Sufficient Contrast](Sufficient-Contrast) — Are labels, icons, etc. perceivable and usable by low vision users? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [High Contrast](High-Contrast) — Is the component perceivable and usable when High Contrast Mode is enabled? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Automatic Positioning](Automatic-Positioning) — Does the component automatically calculate positions for its elements?

✓ [Child Positioning](Child-Positioning) — Can child elements be positioned relative to their container within the component?

✓ [Responsive](Responsive) — Does the component scale well to standard mobile, tablet, and desktop screen sizes?

✓ [Magnification](Magnification) — Does the component render correctly when magnified? [![Accessibility](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png)Accessibility](https://github.com/webcomponents/gold-standard/wiki#accessibility)

✓ [Style Recalc](Style-Recalc) — Can you apply styles to a component instance even after it’s attached to the document?

✓ [Size Recalc](Size-Recalc) — If the component manually positions any subelements relative to its own size, does it appropriately recalc these positions when its own size changes?



## <a name="API"></a>API

✓ [Member Order Independence](Member-Order-Independence) — Can you set or invoke the component’s attributes, properties, and methods in any order?

✓ [Member Combinations](Member-Combinations) — Can you generally use all the component’s attributes, properties, and methods in any combination?

✓ [Member Stability](Member-Stability) — If you change a component property or contents, then immediately get that property or contents, do you generally get the same result back?

✓ [Required Properties](Required-Properties) — Does the component avoid requiring properties to
be set unless absolutely necessary?

✓ [Exposed Methods](Exposed-Methods) — Can you programmatically trigger all of the component’s key functionality through methods, rather than relying on user interaction?

✓ [Exposed Events](Exposed-Events) — Does the component raise events for all key points in its use?

✓ [Property Change Events](Property-Change-Events) — Does the component raise property change events when — and only when — properties change in response to internal component activity?

✓ [Documented API](Documented-API) — Does the component document its public API?



## <a name="Performance"></a>Performance

✓ [Computational Performance](Computational-Performance) — Generally speaking, does the component perform its core functions reasonably quickly?

✓ [Network Performance](Network-Performance) — If the component uses the network, does it do so efficiently?

✓ [Render Performance](Render-Performance) — Is the component quick to get pixels on the screen when first loading and when updating?

✓ [Vector Graphics](Vector-Graphics) — Where possible and appropriate, are the component’s graphics in a scalable vector form?

✓ [Progress Feedback](Progress-Feedback) — For long operations, can the component provide appropriate feedback?



## <a name="Localization"></a>Localization

✓ [Localizable Strings](Localizable-Strings) — Can text presented by the component be replaced for use in other languages?

✓ [Date+Time Format](Date+Time-Format) — If the component accepts or renders dates and/or times, can you change the date/time format?

✓ [Currency Format](Currency-Format) — If the component accepts or renders currency amounts, can you change the currency format?

✓ [Right-to-Left](Right-to-Left) — Can the component be configured to flip its presentation for use in right-to-left languages like Arabic and Hebrew?



## <a name="Factoring"></a>Factoring

✓ [Base Class](Base-Class) — If the component is a special case of another component, does it appropriately subclass from (or at least compose an instance of) that base class?

✓ [Composition](Composition) — Does the component appropriately delegate responsibilities to existing standard components when possible?

✓ [Subclassable](Subclassable) — Is the component subclassable?

✓ [Overridable Methods](Overridable-Methods) — Does the component provide internal methods for key functionality, such that a subclass can override those methods to refine their behavior?



## <a name="Development"></a>Development

✓ [Purpose Statement](Purpose-Statement) — Does the component’s header comment begin with a short (ideally, single sentence) statement of the component’s purpose?

✓ [Code Style Guide](Code-Style-Guide) — Does the source code comply with a standard source code style guide?

✓ [Open License](Open-License) — If the component presents itself as open source, has it been assigned a standard form of a common open source license?

✓ [Clean Console](Clean-Console) — Does the component avoid writing to the debug console unless specifically requested to do so?

✓ [Prefixed Name](Prefixed-Name) — Does the component have a name prefixed with a project name, element collection name, organization, or something with semantic meaning?



## <a name="Accessibility"></a>Accessibility

![Universal Access icon](https://raw.githubusercontent.com/wiki/webcomponents/gold-standard/resources/Universal%20Access%20Icon.png) The checklist items marked with the person icon are particularly important for universal accessibility. These items not only allow users with disabilities (visual, motor, etc.) to use all aspects of an application, but also benefit the general user population in a variety of common situations: where a keyboard is preferred, where it is difficult to read the display, where it is too loud to hear audio, etc.


## Limitations

Given the relatively new appearance of web components, there are a number of [Web Component Limitations](Web-Component-Limitations) that may prevent a component from acting as perfectly as a standard HTML element. One goal of the Gold Standard effort is to draw such limitations to the attention of browser vendors so that these might be addressed in future standards work.


## Sponsors

Oversight of the Gold Standard Checklist for Web Components is provided by [Component Kitchen](https://component.kitchen). Component Kitchen is a member of the [Elix](https://elix.org) project, which is dedicated to creating general-purpose web components that meet the Gold Standard.

[![Elix logo](https://elix.org/static/images/elix.png)](https://elix.org)
