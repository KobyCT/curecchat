import { useContext } from "react";
import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notifications from "./Chat/Notifications";

const NavBar = () => {
  const { user } = useContext(AuthContext);

  return (
    <Navbar bg="dark" className="mb-4" style={{ height: "3.75rem" }}>
      <Container>
        <h2>
          <Link to="/" className="link-light text-decoration-none">
            ChattApp
          </Link>
        </h2>
        {user && <span className="text-warning">Logged in as {user?.firstnameen}</span>}
        <Nav>
          <Stack direction="horizontal" gap={3}>

            {user && (
              <>
                <Notifications />
              </>
            )}
          </Stack>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
