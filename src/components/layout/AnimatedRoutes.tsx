
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import AppRoutes from "@/routes/AppRoutes";

const AnimatedRoutes = () => {
  const location = useLocation();
  const nodeRef = useRef(null);
  
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        timeout={200} // Reduced from 300ms to 200ms for faster transitions
        classNames="route-transition"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="page-transition">
          <AppRoutes />
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AnimatedRoutes;
