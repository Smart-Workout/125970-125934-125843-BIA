interface FormattedTextProps {
  text: string
}

const headingPattern = /^(\d+[\).]\s*)?([A-Z][A-Za-z\s/&-]{2,42}):$/

export default function FormattedText({ text }: FormattedTextProps) {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}|\n(?=\d+[\).]\s)|\n(?=[A-Z][A-Za-z\s/&-]{2,42}:)/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (!blocks.length) return null

  return (
    <div className="formatted-text">
      {blocks.map((block, index) => {
        const isHeading = headingPattern.test(block)
        const [possibleHeading, ...rest] = block.split(/:\s+/)
        const hasInlineHeading = rest.length > 0 && possibleHeading.length <= 46

        if (isHeading) {
          return <strong key={`${block}-${index}`} className="formatted-heading">{block.replace(/:$/, '')}</strong>
        }

        if (hasInlineHeading) {
          return (
            <p key={`${block}-${index}`}>
              <strong>{possibleHeading}:</strong> {rest.join(': ')}
            </p>
          )
        }

        return <p key={`${block}-${index}`}>{block}</p>
      })}
    </div>
  )
}
