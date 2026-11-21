import type { ReactNode } from "react";
import Link from "next/link";
import type { BlockNode, InlineNode, ListItemNode } from "@/lib/markdown";
import CodeBlock from "./CodeBlock";

function renderInline(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (node.type) {
      case "text":
        return <span key={key}>{node.value}</span>;
      case "code":
        return <code key={key}>{node.value}</code>;
      case "strong":
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case "em":
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case "del":
        return <del key={key}>{renderInline(node.children, key)}</del>;
      case "link":
        if (node.external) {
          return (
            <a key={key} href={node.href} target="_blank" rel="noreferrer">
              {renderInline(node.children, key)}
            </a>
          );
        }
        return (
          <Link key={key} href={node.href}>
            {renderInline(node.children, key)}
          </Link>
        );
    }
  });
}

function renderListItems(items: ListItemNode[], keyPrefix: string): ReactNode[] {
  return items.map((item, idx) => {
    const key = `${keyPrefix}-li-${idx}`;
    return (
      <li key={key}>
        {renderInline(item.children, key)}
        {item.sublist ? (
          item.sublist.ordered ? (
            <ol>{renderListItems(item.sublist.items, `${key}-sub`)}</ol>
          ) : (
            <ul>{renderListItems(item.sublist.items, `${key}-sub`)}</ul>
          )
        ) : null}
      </li>
    );
  });
}

function renderBlocks(blocks: BlockNode[], keyPrefix: string): ReactNode[] {
  return blocks.map((block, idx) => {
    const key = `${keyPrefix}-b-${idx}`;
    switch (block.type) {
      case "heading": {
        const content = (
          <span className="docs-heading-anchor">
            <span>{renderInline(block.children, key)}</span>
            {block.level >= 2 ? (
              <a className="docs-anchor-hash" href={`#${block.id}`} aria-label={`Link to ${block.text}`}>
                #
              </a>
            ) : null}
          </span>
        );
        if (block.level === 1) return <h1 key={key} id={block.id}>{content}</h1>;
        if (block.level === 2) return <h2 key={key} id={block.id}>{content}</h2>;
        if (block.level === 3) return <h3 key={key} id={block.id}>{content}</h3>;
        return <h4 key={key} id={block.id}>{content}</h4>;
      }
      case "paragraph":
        return <p key={key}>{renderInline(block.children, key)}</p>;
      case "code":
        return <CodeBlock key={key} lang={block.lang} value={block.value} />;
      case "blockquote":
        return <blockquote key={key}>{renderBlocks(block.blocks, key)}</blockquote>;
      case "list":
        return block.ordered ? (
          <ol key={key}>{renderListItems(block.items, key)}</ol>
        ) : (
          <ul key={key}>{renderListItems(block.items, key)}</ul>
        );
      case "table":
        return (
          <div key={key} className="docs-table-wrap">
            <table>
              <thead>
                <tr>
                  {block.headers.map((cell, ci) => (
                    <th key={`${key}-th-${ci}`}>{renderInline(cell, `${key}-th-${ci}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={`${key}-tr-${ri}`}>
                    {row.map((cell, ci) => (
                      <td key={`${key}-td-${ri}-${ci}`}>{renderInline(cell, `${key}-td-${ri}-${ci}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "hr":
        return <hr key={key} />;
    }
  });
}

export default function MarkdownView({ blocks }: { blocks: BlockNode[] }) {
  return <div className="docs-prose">{renderBlocks(blocks, "md")}</div>;
}
