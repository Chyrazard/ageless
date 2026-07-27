import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import styles from "./whatsapp-button.module.css";

const WHATSAPP_URL =
  "https://wa.me/17866565817?text=Hello%21%20I%E2%80%99m%20interested%20in%20attending%20the%20Ageless%20Summit%3A";

export function WhatsAppButton() {
  return (
    <a
      className={styles.button}
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Ageless Summit on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <FontAwesomeIcon className={styles.icon} icon={faWhatsapp} />
    </a>
  );
}
