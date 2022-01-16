# eevent

A small library to get listeners added in elements.

## Usage
After installation the only thing you need to do is import the module:

```js
import 'eevent';

const dom1 = document.getElementById('eevent')
dom1.addEventListener('click', (e) => {
  console.log('click1')
})
dom1.onclick = function() {
  console.log('click2');
}

console.log(dom1.getAllEvents())
console.log(dom1.getAllEventListeners())
```

- `getAllEventListeners`: Gets a map of all the listeners.
- `getAllEvents`: Gets all the listener's names.


## Instruction

This package will not be working in IE.


## License

[MIT](LICENSE)