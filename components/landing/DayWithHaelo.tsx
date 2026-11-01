import { assets } from "./assets";
import { Heading, Photo, Vector } from "./Primitives";

const moments = [
  {
    photo: assets.day.momentCard,
    icon: assets.day.iconCar,
    time: "07:40 · Lagos traffic",
    title: "3 approvals sent",
    description: "Before she reached the office",
    alt: "Executive checking her phone in Lagos traffic",
  },
  {
    photo: assets.day.momentCard1,
    icon: assets.day.icon,
    time: "10:15 · Board meeting",
    title: "Leave request approved",
    description: "Without leaving the room",
    alt: "Executive leading a board meeting",
  },
  {
    photo: assets.day.momentCard2,
    icon: assets.day.icon1,
    time: "13:30 · Site visit",
    title: "₦1.2m payment flagged",
    description: "Waiting for her explicit YES",
    alt: "Executive visiting a construction site",
  },
  {
    photo: assets.day.momentCard3,
    icon: assets.day.icon2,
    time: "18:50 · Departure lounge",
    title: "Inbox at zero",
    description: "Before boarding was called",
    alt: "Executive waiting in an airport departure lounge",
  },
];
export default function DayWithHaelo() {
  return (
    <section
      className="landing-section day-section"
      aria-labelledby="day-heading"
    >
      <div className="landing-container">
        <Heading
          eyebrow="A day with Haelo"
          id="day-heading"
          description="Car, boardroom, site visit, departure lounge. Haelo keeps your team moving in the gaps between everything else."
        >
          Run the business from
          <br />
          <em>wherever the day takes you.</em>
        </Heading>
        <div className="moment-grid">
          {moments.map((moment) => (
            <article className="moment-card" key={moment.time}>
              <Photo
                src={moment.photo.src}
                alt={moment.alt}
                sizes="(max-width: 767px) 50vw, 25vw"
              />
              <span className="moment-time">
                <Vector asset={moment.icon} />
                {moment.time}
              </span>
              <div className="moment-toast">
                <span>
                  <Vector asset={assets.day.iconCheck} />
                </span>
                <div>
                  <h3>{moment.title}</h3>
                  <p>{moment.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
