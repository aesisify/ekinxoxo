<template>
  <div class="py-4 px-6" id="app">
    <header>
      <nav class="flex flex-row gap-2">
        <router-link class="uppercase font-semibold" to="/"
          exact-active-class="text-blue-500 underline">Ekinxoxo</router-link>
        <router-link class="uppercase font-semibold" to="/nono"
          exact-active-class="text-blue-500 underline">Ekinnono</router-link>
      </nav>
    </header>

    <router-view />

    <div class="fixed bottom-0 right-0 text-xs flex gap-1 items-center m-1">
      <Icon class="h-4 w-4" icon="ph:code-light"></Icon>
      <span>with</span>
      <Icon class="h-4 w-4 text-red-500" icon="ph:heart-light"></Icon>
      <span>by</span>
      <a class="underline text-indigo-300" href="https://github.com/aesisify/" target="_blank">
        Oğuz "Aesisify" Gergin
      </a>
    </div>

  </div>
</template>