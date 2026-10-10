; Syntax highlighting for .http files (JetBrains HTTP Client subset).

; ---------- Comments ----------
(comment) @comment

; ---------- Request separators ----------
(separator "###" @punctuation.special)
(separator name: (separator_text) @string.special)

; ---------- File-scope variable declarations ----------
(variable_declaration "@" @punctuation.special)
(variable_declaration name: (identifier) @variable)
(variable_declaration "=" @operator)
(variable_declaration value: (variable_value) @string)

; ---------- Request line ----------
(method) @keyword
(url) @link_uri
(http_version) @constant

; ---------- Headers ----------
(header name: (header_name) @property)
(header ":" @punctuation.delimiter)
(header value: (header_value) @string)

; ---------- Interpolations {{ var }} ----------
(interpolation "{{" @punctuation.special)
(interpolation "}}" @punctuation.special)
(interpolation name: (interpolation_name) @variable.special)

; ---------- Body ----------
(body_line) @string

; ---------- Response handler `> {% ... %}` ----------
(response_handler ">" @punctuation.special)
(response_handler "{%" @punctuation.special)
(response_handler "%}" @punctuation.special)
(response_handler body: (handler_body) @embedded)
