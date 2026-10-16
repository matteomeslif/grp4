// Behavior « lecteur » : barre de lecture audio mp3 à l'écran.

// =============================================================================
// EMPLACEMENT DU FICHIER AUDIO À LIRE :
// Dépose ton fichier mp3 dans experience/assets/ puis indique son chemin ci-dessous :
const MORCEAU = {
  titre: 'Mon morceau',
  artiste: 'Nom de l’artiste',
  src: 'assets/demo/boucle.mp3', // <-- CHANGE ICI LE CHEMIN DE TON FICHIER MP3 (ex: 'assets/musique.mp3')
}
// =============================================================================

/**
 * Formate un nombre de secondes en format "mm:ss"
 * @param {number} sec 
 */
function formaterTemps(sec) {
  if (isNaN(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

/** @type {import('../../core/behaviors').Behavior} */
export default {
  onFound(ctx) {
    // Si le lecteur est déjà créé lors d'une détection précédente, on ne le recrée pas
    if (ctx.state.audio) return

    // keep: true → la barre reste à l'écran et le son continue même si l'affiche sort du champ
    const panneau = ctx.ui.panel('lecteur-audio', { position: 'bottom', keep: true })

    panneau.innerHTML = `
      <div class="lecteur-barre">
        <button class="lecteur-btn-play" aria-label="Lecture / Pause">▶</button>
        <div class="lecteur-corps">
          <div class="lecteur-metas">
            <span class="lecteur-titre">${MORCEAU.titre}</span>
            <span class="lecteur-artiste">${MORCEAU.artiste}</span>
            <span class="lecteur-temps"><span class="temps-actuel">0:00</span> / <span class="temps-total">0:00</span></span>
          </div>
          <div class="lecteur-piste">
            <div class="lecteur-progression"></div>
          </div>
        </div>
      </div>
    `

    // Styles CSS isolés pour le panneau de lecture
    ctx.ui.style(`
      .lecteur-audio {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        padding: 12px 16px;
        background: var(--ra-bg, rgba(18, 18, 20, 0.92));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        color: var(--ra-text, #ffffff);
        font-family: var(--ra-ui-font, system-ui, sans-serif);
      }
      .lecteur-barre {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .lecteur-btn-play {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 0;
        background: var(--ra-color, #ff3b30);
        color: var(--ra-text, #ffffff);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .lecteur-btn-play:active {
        transform: scale(0.92);
        filter: brightness(1.15);
      }
      .lecteur-corps {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .lecteur-metas {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
      }
      .lecteur-titre {
        font-weight: 600;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .lecteur-artiste {
        opacity: 0.65;
        font-size: 12px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .lecteur-temps {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
        font-size: 11px;
        opacity: 0.6;
      }
      .lecteur-piste {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        overflow: hidden;
        cursor: pointer;
        position: relative;
      }
      .lecteur-progression {
        width: 0%;
        height: 100%;
        background: var(--ra-color, #ff3b30);
        border-radius: 999px;
        transition: width 0.1s linear;
      }
    `)

    // Initialisation de l'élément audio (unique pour respecter la politique audio iOS/Android)
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src = MORCEAU.src.startsWith('http') ? MORCEAU.src : ctx.asset(MORCEAU.src)
    ctx.state.audio = audio

    const btnPlay = panneau.querySelector('.lecteur-btn-play')
    const barreProgression = panneau.querySelector('.lecteur-progression')
    const piste = panneau.querySelector('.lecteur-piste')
    const tempsActuel = panneau.querySelector('.temps-actuel')
    const tempsTotal = panneau.querySelector('.temps-total')

    const basculerLecture = () => {
      if (audio.paused) {
        audio.play().catch((err) => {
          ctx.log(`Impossible de lancer l'audio : ${err.message}`)
        })
      } else {
        audio.pause()
      }
    }

    btnPlay.addEventListener('click', basculerLecture)

    // Clic sur la barre pour avancer/reculer
    piste.addEventListener('click', (e) => {
      const rect = piste.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      if (audio.duration) {
        audio.currentTime = ratio * audio.duration
      }
    })

    audio.addEventListener('play', () => {
      btnPlay.textContent = '⏸'
    })

    audio.addEventListener('pause', () => {
      btnPlay.textContent = '▶'
    })

    audio.addEventListener('loadedmetadata', () => {
      tempsTotal.textContent = formaterTemps(audio.duration)
    })

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return
      const pct = (audio.currentTime / audio.duration) * 100
      barreProgression.style.width = `${pct}%`
      tempsActuel.textContent = formaterTemps(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      btnPlay.textContent = '▶'
      barreProgression.style.width = '0%'
      tempsActuel.textContent = '0:00'
    })
  },
}
