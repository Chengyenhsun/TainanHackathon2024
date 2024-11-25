/*

async function loadCategories() {
    const resultContainer = document.getElementById('filter-options');
//    resultContainer.innerHTML = '';

    const { data, error } = await supabase
        .from('categories')
        .select('name');

    if (error) {
        console.error('Error fetching categories:', error);
        resultContainer.innerText = '無法獲取分類資料';
    } else {
        data.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.name;
            button.classList.add('filter-btn');
            button.dataset.category = category.name;

            button.addEventListener('click', function() {
                button.classList.toggle('selected');
                
                const selectedCategories = document.querySelectorAll('.filter-btn.selected');
                const selectedCategoryNames = Array.from(selectedCategories).map(btn => btn.dataset.category);
                console.log('選擇的分類:', selectedCategoryNames);

            });

            resultContainer.appendChild(button);
        });
    }
}

loadCategories();

*/
