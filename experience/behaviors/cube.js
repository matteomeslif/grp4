/** @type {import('../../core/behaviors').Behavior} */
export default {
  onFound(ctx) {
    if (!ctx.state.cube) {
      // Cube 3D de 20 % de la largeur de l'affiche (taille 0.2)
      const size = 0.2
      const geometry = new ctx.THREE.BoxGeometry(size, size, size)
      const material = new ctx.THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.35,
        metalness: 0.1,
      })
      const mesh = new ctx.THREE.Mesh(geometry, material)

      // Positionné au centre de l'affiche (0.5, 0.5), décollé de 0.15 vers le spectateur
      mesh.position.copy(ctx.toLocal(0.5, 0.5, 0.15))

      // Ajouté à l'affiche
      ctx.poster.add(mesh)
      ctx.state.cube = mesh
    }

    ctx.state.cube.visible = true
  },

  onLost(ctx) {
    if (ctx.state.cube) {
      ctx.state.cube.visible = false
    }
  },

  onUpdate(ctx, t, dt) {
    if (ctx.state.cube && ctx.state.cube.visible) {
      // Rotation lente sur lui-même
      ctx.state.cube.rotation.x += dt * 0.5
      ctx.state.cube.rotation.y += dt * 0.7
    }
  },
}
