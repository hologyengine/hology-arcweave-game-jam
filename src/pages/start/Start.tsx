import "reflect-metadata"
import "./Start.scss"
import { Link } from "react-router"
import bg from "./start-bg.png"

function GameTitle({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  return (
    <h1>
      {parts.map((part, i) => (
        <span key={i}>{part}</span>
      ))}
    </h1>
  )
}

function Start() {
  const search = window.location.search
  const params = new URLSearchParams(search)
  const projectId = params.get('project')

  const gameName = "Lakeside Mystery"

  // need to pass along query parameter
  return (
    <>
      <div className="start-screen-bg">
        <GameTitle name={gameName} />
        <Link to={`/game${projectId != null ? '?project=' + projectId : ''}`}>
          <div className="banner-button">
            <span>Play</span>
          </div>
        </Link>
        <a href="https://hology.app" target="_blank">
          <img className="promo-image" src="made-with-hology.png" width={130} alt="" />
        </a>
      </div>
    </>
  )
}

export default Start
