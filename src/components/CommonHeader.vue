<script setup>
const baseUrl = import.meta.env.BASE_URL

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <header>
    <nav>
      <h2>
        <a :href="baseUrl"
          ><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 30 30">
            <path
              fill="#fff"
              d="M 15 2 A 1 1 0 0 0 14.300781 2.2851562 L 3.3925781 11.207031 A 1 1 0 0 0 3.3554688 11.236328 L 3.3183594 11.267578 L 3.3183594 11.269531 A 1 1 0 0 0 3 12 A 1 1 0 0 0 4 13 L 5 13 L 5 24 C 5 25.105 5.895 26 7 26 L 23 26 C 24.105 26 25 25.105 25 24 L 25 13 L 26 13 A 1 1 0 0 0 27 12 A 1 1 0 0 0 26.681641 11.267578 L 26.666016 11.255859 A 1 1 0 0 0 26.597656 11.199219 L 25 9.8925781 L 25 6 C 25 5.448 24.552 5 24 5 L 23 5 C 22.448 5 22 5.448 22 6 L 22 7.4394531 L 15.677734 2.2675781 A 1 1 0 0 0 15 2 z M 18 15 L 22 15 L 22 23 L 18 23 L 18 15 z"
            ></path></svg
        ></a>
      </h2>
      <div>
        <h1>{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
        <p class="description">{{ description }}</p>
      </div>
      <a :href="`https://github.com/humo-tech${baseUrl}/`" target="_blank">
        <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32">
          <path
            fill="#fff"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          ></path>
        </svg>
      </a>
    </nav>
  </header>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  color: #fff;
  margin-bottom: 20px;
  z-index: 10;
  background-color: #0003;
  text-shadow: 1px 1px 0px #000;
}
nav {
  padding: 5px 15px 5px;
  display: flex;
  justify-content: space-between;
}
h1,
h2 {
  margin: 0;
  text-align: center;
}
.description,
.subtitle {
  margin: 0;
  text-align: center;
}
.description {
  color: #ccc;
  font-style: italic;
}
</style>
