import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your email content...",
  height = "300px",
  readOnly = false
}) => {
  // Custom toolbar configuration optimized for email templates
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['clean'],
      // Custom button for inserting variables
      ['variable']
    ]
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'blockquote', 'code-block',
    'script'
  ];

  // Custom styles for the editor
  const editorStyle = {
    height: height,
    marginBottom: '20px'
  };

  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <style>{`
        .ql-editor {
          min-height: ${height};
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        
        .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: italic;
        }
        
        /* Custom styles for email-friendly formatting */
        .ql-editor h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #1f2937;
        }
        
        .ql-editor h2 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 14px;
          color: #374151;
        }
        
        .ql-editor h3 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #4b5563;
        }
        
        .ql-editor p {
          margin-bottom: 12px;
        }
        
        .ql-editor ul, .ql-editor ol {
          margin-bottom: 12px;
          padding-left: 20px;
        }
        
        .ql-editor li {
          margin-bottom: 4px;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 16px 0;
          color: #6b7280;
          font-style: italic;
        }
        
        .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ql-editor strong {
          font-weight: bold;
        }
        
        .ql-editor em {
          font-style: italic;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={editorStyle}
        readOnly={readOnly}
      />
      
      {/* Variable insertion helper */}
      <div className="mt-2 text-xs text-gray-600">
        <strong>Tip:</strong> Use double curly braces for variables, e.g., <code className="bg-gray-100 px-1 rounded">{'{{candidateName}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{position}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{company}}'}</code>
      </div>
    </div>
  );
};

export default RichTextEditor;
