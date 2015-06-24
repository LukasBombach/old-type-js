## Caret

```javascript
type.caret()
// Returns the offset of the caret

type.caret(10)
// Moves the caret to the 10th character

type.caret(10, 20)
// Selects characters 10 to 20

type.caret('hide')
// Hides the caret

type.caret('show')
// Show the caret
```

## Selection

```javascript
type.selection()
// Same as type.selection('text')

type.selection('text')
// Returns the unformatted (plain) contents of the current selection

type.selection('html')
// Return the currently selected HTML

type.selection(10)
// Moves the caret to the 10th character (does not select anything)

type.selection(10, 20)
// Selects characters 10 to 20

type.selection(element)
// Select an element

type.selection(element1, element2)
// Creates a selection between 2 elements

type.selection(jQueryCollection)
// Creates a selection between the first and last element in the jQuery Collection

type.selection('save')
// Returns an object that can be passed to type.selection('restore') to store and recreate a selection

type.selection('restore', sel)
// Takes an object returned by type.selection('save') as a second argument to recreate a stored selection
```

## Format

```javascript
type.format(tagName, [...params])
// Formats the currently selected text with the given tag.
// E.g. use type.cmd('strong') to format the currently selected text bold   
```

## Remove

```javascript
type.remove()
// Deletes the currently selected text. Does nothing if there is no selection.

type.remove(numChars)
// Removes a number of characters from the caret's position. A negative number will remove characters left
// of the caret, a positive number from the right. If there is a selection, the characters will be removed
// from the end of the selection.

type.remove(startOffset, endOffset)
// Will remove characters between the given offsets
```

## Settings
```javascript
type.settings()
// Returns all settings

type.settings(name)
// Getter for a specific setting

type.settings(name, values)
// Setter for a specific setting

type.settings({object})
// Pass an object to set multiple settings
```
