/**
 * tree-sitter-http-request
 *
 * Grammar for JetBrains-compatible .http files (MVP subset).
 */

module.exports = grammar({
  name: 'http',

  extras: $ => [/[ \t]+/],

  conflicts: $ => [
    [$.request],
  ],

  rules: {
    document: $ => repeat(choice(
      $.comment_line,
      $.variable_declaration,
      $.request,
      $._blank_line,
    )),

    // ------------------------------------------------------------
    // Comments (whole line)
    // ------------------------------------------------------------

    comment_line: $ => seq($.comment, $._newline),

    // A comment is `//...` or `#...` where `#` is not the start of `###`.
    // We match `#` followed by anything that isn't `##` (with lookahead-like
    // regex negation) or a bare `#` on its own line.
    comment: $ => token(choice(
      seq('//', /[^\r\n]*/),
      /#([^#\r\n][^\r\n]*)?/,
    )),

    // ------------------------------------------------------------
    // Variable declaration: `@name = value` on its own line
    // ------------------------------------------------------------

    variable_declaration: $ => seq(
      '@',
      field('name', $.identifier),
      '=',
      field('value', optional($.variable_value)),
      $._newline,
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_.-]*/,

    variable_value: $ => /[^\r\n]+/,

    // ------------------------------------------------------------
    // Request block
    // ------------------------------------------------------------

    request: $ => seq(
      $.separator,
      repeat(choice($.comment_line, $.variable_declaration, $._blank_line)),
      optional(seq(
        $.request_line,
        $._newline,
        repeat($.header),
        optional(seq(
          $._blank_line,
          optional($.body),
          repeat($._blank_line),
          optional($.response_handler),
        )),
      )),
    ),

    separator: $ => seq(
      '###',
      optional(field('name', alias(token.immediate(/[^\r\n]*/), $.separator_text))),
      $._newline,
    ),

    // ------------------------------------------------------------
    // Request line: METHOD URL [HTTP-version]
    // ------------------------------------------------------------

    request_line: $ => seq(
      field('method', $.method),
      field('url', $.url),
      optional(field('http_version', $.http_version)),
    ),

    method: $ => choice(
      'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
    ),

    url: $ => repeat1(choice(
      $.interpolation,
      $._url_text,
    )),

    _url_text: $ => token(prec(-1, /[^\s{}\r\n]+/)),

    http_version: $ => /HTTP\/[0-9](\.[0-9])?/,

    // ------------------------------------------------------------
    // Headers
    // ------------------------------------------------------------

    header: $ => seq(
      field('name', $.header_name),
      ':',
      optional(field('value', $.header_value)),
      $._newline,
    ),

    header_name: $ => /[A-Za-z][A-Za-z0-9_-]*/,

    header_value: $ => repeat1(choice(
      $.interpolation,
      $._header_value_text,
    )),

    _header_value_text: $ => token(prec(-1, /[^\r\n{}]+/)),

    // ------------------------------------------------------------
    // Body
    // ------------------------------------------------------------

    body: $ => repeat1($.body_line),

    body_line: $ => seq(
      // A body line's first token can be either a piece of text (which must
      // not start with `>`, since `>` opens a response_handler) or an
      // interpolation `{{...}}`.
      choice(
        seq(
          $._body_leading_text,
          repeat(choice(
            $.interpolation,
            $._body_text,
          )),
        ),
        seq(
          $.interpolation,
          repeat(choice(
            $.interpolation,
            $._body_text,
          )),
        ),
      ),
      $._newline,
    ),

    // Leading text of a body line: like `_body_text` but cannot start with `>`.
    // We allow it to start with `{` (JSON bodies) but internal `{{` starting
    // an interpolation is handled by the outer choice.
    _body_leading_text: $ => token(prec(-1, choice(
      /[^\r\n{>][^\r\n{]*/,
      /\{[^{\r\n]/,   // `{` followed by any non-`{` non-newline char
      /\{/,           // bare `{` (at EOL or before a body_text `{`)
    ))),

    // Body text: any run of characters that is not the start of `{{`
    // (an interpolation) and not a newline. We match runs of "safe"
    // chars, or a single `{` that is NOT followed by another `{`.
    _body_text: $ => token(prec(-1, choice(
      /[^\r\n{]+/,
      /\{/,  // single `{` — could be `{` at EOL or `{` before a non-`{` char handled by the next token
    ))),

    // ------------------------------------------------------------
    // Response handler: `> {% ... %}`
    // ------------------------------------------------------------

    response_handler: $ => seq(
      '>',
      '{%',
      optional(field('body', $.handler_body)),
      '%}',
    ),

    // Opaque handler body: any character up to `%}`.
    handler_body: $ => token(prec(-1, /(([^%]|%[^}])+)/)),

    // ------------------------------------------------------------
    // Interpolation: {{ name }}
    // ------------------------------------------------------------

    interpolation: $ => seq(
      '{{',
      field('name', $.interpolation_name),
      '}}',
    ),

    interpolation_name: $ => /[ \t]*[A-Za-z_$][A-Za-z0-9_.-]*[ \t]*/,

    // ------------------------------------------------------------
    // Newlines
    // ------------------------------------------------------------

    _newline: $ => /\r?\n/,
    _blank_line: $ => /\r?\n/,
  },
});
