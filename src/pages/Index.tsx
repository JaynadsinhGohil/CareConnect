import { useEffect } from "react";
import Landing from "./Landing";

const Index = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return <Landing />;
};

export default Index;
