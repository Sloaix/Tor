import classNames from 'classnames'

function syntaxHighlight(json: string) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var classes = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          classes = 'key text-blue-700'
        } else {
          classes = 'string text-red-700'
        }
      } else if (/true|false/.test(match)) {
        classes = 'boolean text-blue-700'
      } else if (/null/.test(match)) {
        classes = 'null text-blue-700'
      }
      return '<span class="' + classes + '">' + match + '</span>'
    }
  )
}

function formatJSON(data: any, hidePieces: boolean) {
  return JSON.stringify(
    data,
    function (key, value) {
      if (key === 'pieces') {
        if (hidePieces) {
          return `Unit8Array[...] has been hidden.`
        } else if (Array.isArray(value)) {
          return `Unit8Arry[${value.join(', ')}]`
        } else {
          return value
        }
      }
      return value
    },
    '\t'
  )
}

export default ({
  data,
  className,
  hidePieces = true
}: {
  data?: Object
  hidePieces?: boolean
  className?: string
}) => {
  if (!data) return null
  return (
    <pre
      className={classNames('whitespace-pre-wrap break-all', className)}
      dangerouslySetInnerHTML={{
        __html: syntaxHighlight(formatJSON(data, hidePieces))
      }}
    />
  )
}
