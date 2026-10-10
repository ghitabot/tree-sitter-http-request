# tree-sitter-http-request

Tree-sitter grammar for JetBrains-compatible `.http` files. Used by the
[`httpclient`](https://github.com/CHANGE_ME/httpclient) Zed extension.

## Supported syntax (MVP subset)

- Request separator `###` with optional trailing name.
- Fixed HTTP methods: `GET POST PUT PATCH DELETE HEAD OPTIONS`.
- Optional HTTP version (`HTTP/1.1`, `HTTP/2`) after the URL.
- Header lines `Name: Value`.
- Blank line before the body; body extends until the next `###` or EOF.
- `{{ variable }}` interpolation in URL, header values, and body.
- `@name = value` file-scope variable declarations.
- Line comments starting with `#` or `//`.

## Known limitations

- A `#` at the very start of a line inside a request body is lexed as a
  comment, not as body content. Editor highlighting will show it as a
  comment; the runner's own parser (independent of tree-sitter) handles
  bodies correctly. Workaround: prefix the line with a space, or use `//`
  syntax if you specifically need it treated as text.

## Development

```
tree-sitter generate
tree-sitter test
tree-sitter parse examples/basic.http
```

## License

0BSD
