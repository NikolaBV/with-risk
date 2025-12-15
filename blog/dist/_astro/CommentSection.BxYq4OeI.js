import{a as p,j as e}from"./api.DMPPpcfj.js";import{r as t}from"./index.CVf8TyFT.js";function C({postSlug:s}){const[m,i]=t.useState([]),[o,l]=t.useState(""),[d,g]=t.useState(""),[x,b]=t.useState(!0),[a,u]=t.useState(!1),[h,n]=t.useState(null);t.useEffect(()=>{v()},[s]);const v=async()=>{try{const r=await p.Comments.list(s);i(r),n(null)}catch(r){console.error("Failed to load comments:",r),n(null),i([])}finally{b(!1)}},y=async r=>{if(r.preventDefault(),!!o.trim()){u(!0),n(null);try{const c=await p.Comments.create({postSlug:s,content:o.trim(),authorName:d.trim()||"Anonymous"});i(N=>[c,...N]),l("")}catch(c){console.error("Failed to post comment:",c),n("Failed to post comment. Please try again.")}finally{u(!1)}}},j=r=>new Date(r).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return x?e.jsxs("div",{className:"comments-loading",children:[e.jsx("div",{className:"loading-spinner"}),e.jsx("p",{children:"Loading comments..."}),e.jsx("style",{children:f})]}):e.jsxs("div",{className:"comments-container",children:[e.jsxs("form",{onSubmit:y,className:"comment-form",children:[e.jsx("input",{type:"text",value:d,onChange:r=>g(r.target.value),placeholder:"Your name (optional)",disabled:a,className:"name-input"}),e.jsx("textarea",{value:o,onChange:r=>l(r.target.value),placeholder:"Share your thoughts...",rows:3,disabled:a,className:"comment-input"}),e.jsxs("div",{className:"form-footer",children:[h&&e.jsx("p",{className:"error-message",children:h}),e.jsx("button",{type:"submit",disabled:a||!o.trim(),className:"submit-button",children:a?"Posting...":"Post Comment"})]})]}),e.jsx("div",{className:"comments-list",children:m.length===0?e.jsx("div",{className:"no-comments",children:e.jsx("p",{children:"No comments yet. Be the first to share your thoughts!"})}):m.map(r=>e.jsxs("article",{className:"comment",children:[e.jsxs("header",{className:"comment-header",children:[e.jsxs("div",{className:"comment-author",children:[r.userImage?e.jsx("img",{src:r.userImage,alt:r.userName,className:"author-avatar"}):e.jsx("div",{className:"author-avatar placeholder",children:r.userName.charAt(0).toUpperCase()}),e.jsx("span",{className:"author-name",children:r.userName})]}),e.jsx("time",{className:"comment-date",children:j(r.createdAt)})]}),e.jsx("p",{className:"comment-content",children:r.content})]},r.id))}),e.jsx("style",{children:f})]})}const f=`
  .comments-container {
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  .comments-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: var(--color-text-muted, #71717a);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--color-border, #27272a);
    border-top-color: var(--color-accent, #f97316);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .comment-form {
    margin-bottom: 2rem;
  }

  .name-input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    background: var(--color-bg-secondary, #12121a);
    border: 1px solid var(--color-border, #27272a);
    border-radius: 8px;
    color: var(--color-text, #e4e4e7);
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--color-accent, #f97316);
  }

  .name-input::placeholder {
    color: var(--color-text-muted, #71717a);
  }

  .comment-input {
    width: 100%;
    padding: 1rem;
    background: var(--color-bg-secondary, #12121a);
    border: 1px solid var(--color-border, #27272a);
    border-radius: 8px;
    color: var(--color-text, #e4e4e7);
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s;
  }

  .comment-input:focus {
    outline: none;
    border-color: var(--color-accent, #f97316);
  }

  .comment-input::placeholder {
    color: var(--color-text-muted, #71717a);
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
  }

  .submit-button {
    padding: 0.75rem 1.5rem;
    background: var(--color-accent, #f97316);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background: var(--color-accent-hover, #fb923c);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .no-comments {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--color-bg-secondary, #12121a);
    border-radius: 12px;
    border: 1px dashed var(--color-border, #27272a);
    color: var(--color-text-muted, #71717a);
  }

  .comment {
    padding: 1.5rem;
    background: var(--color-bg-secondary, #12121a);
    border: 1px solid var(--color-border, #27272a);
    border-radius: 12px;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .comment-author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }

  .author-avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-accent, #f97316);
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .author-name {
    font-weight: 600;
    color: var(--color-text, #e4e4e7);
  }

  .comment-date {
    font-size: 0.8rem;
    color: var(--color-text-muted, #71717a);
  }

  .comment-content {
    color: var(--color-text, #e4e4e7);
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    .comment-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
`;export{C as default};
