import{a as n,j as t}from"./api.DMPPpcfj.js";import{r as i}from"./index.CVf8TyFT.js";function b({postSlug:s}){const[l,a]=i.useState(0),[o,r]=i.useState(!1),[c,d]=i.useState(!0);i.useEffect(()=>{k()},[s]);const k=async()=>{try{const e=await n.Posts.getStats(s);a(e.likes),r(e.isLikedByUser)}catch{console.log("API not available for stats"),a(0),r(!1)}finally{d(!1)}},u=async()=>{try{o?(await n.Posts.unlike(s),a(e=>e-1),r(!1)):(await n.Posts.like(s),a(e=>e+1),r(!0))}catch(e){console.error("Failed to toggle like:",e)}};return c?t.jsxs("button",{className:"like-button loading",disabled:!0,children:[t.jsx("span",{className:"like-icon",children:"♡"}),t.jsx("span",{children:"..."})]}):t.jsxs(t.Fragment,{children:[t.jsxs("button",{className:`like-button ${o?"liked":""}`,onClick:u,"aria-label":o?"Unlike this post":"Like this post",children:[t.jsx("span",{className:"like-icon",children:o?"♥":"♡"}),t.jsx("span",{className:"like-count",children:l})]}),t.jsx("style",{children:`
        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--color-bg-secondary, #12121a);
          border: 1px solid var(--color-border, #27272a);
          border-radius: 8px;
          color: var(--color-text-muted, #71717a);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .like-button:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .like-button.liked {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }

        .like-button.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .like-icon {
          font-size: 1.1rem;
          transition: transform 0.2s ease;
        }

        .like-button:hover .like-icon {
          transform: scale(1.15);
        }

        .like-button.liked .like-icon {
          animation: heartBeat 0.3s ease-in-out;
        }

        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `})]})}export{b as default};
